onedev.server.inputassist = {
	init: function(inputId, callback) {
		var $input = $("#" + inputId);
		
		$input.data("prevValue", $input.val());
		$input.data("prevCaret", -1);
		$input.on("input click keyup", function(e) {
			var value = $input.val();
			var caret;
			if ($input.is(":focus"))
				caret = $input.caret();
			else
				caret = -1;
			if (value != $input.data("prevValue") || caret != $input.data("prevCaret") || !$input.data("dropdown")) {
				$input.data("prevValue", value);
				$input.data("prevCaret", caret);
				if ($input.is(":focus") && e.keyCode != 27 && e.keyCode != 13) // ignore esc, enter
					callback("input", value, caret);
			}
			if (value.trim().length == 0)
				onedev.server.inputassist.markErrors(inputId, []);
		});
		function onFocus() {
			var value = $input.val();
			if (value.length == 0 && $input.closest(".has-error").length == 0) {
				var caret = $input.caret();
				$input.data("prevValue", value);
				$input.data("prevCaret", caret);
				callback("input", value, caret);
			}
			$input.off("focus", onFocus);
		}
		$input.on("focus", onFocus);
		
		$input.on("blur", function(e) {
			$input.data("prevCaret", -1);
		});

		$input.data("update", function($item) {
			var value = $item.data("content");
			$input.val(value);
			var caret = $item.data("caret");
			if (caret != undefined)
				$input.caret(caret);
			$input.focus();
			$input.trigger("input");
		});
		
		$input.bind("keydown", "up", function() {
			var $dropdown = $input.data("dropdown");
			if ($dropdown) {
				var $active = $dropdown.find("tr.active");
				if ($active.length != 0) {
					var $prev = $active.prev("tr:not(.loading-indicator)");
					if ($prev.length != 0) {
						$prev.addClass("active");
						$active.removeClass("active");
					}
				} else {
					$dropdown.find("tr:not(.loading-indicator)").last().addClass("active");
				}
				$dropdown.find(".suggestions").jumpIntoView("tr.active");
				onedev.server.inputassist.updateHelp($dropdown);
				$dropdown.align($dropdown.data("alignment"));
				return false;
			}
		});
		
		$input.bind("keydown", "down", function() {
			var $dropdown = $input.data("dropdown");
			if ($dropdown) {
				var $active = $dropdown.find("tr.active");
				if ($active.length != 0) {
					var $next = $active.next("tr:not(.loading-indicator)");
					if ($next.length != 0) {
						$next.addClass("active");
						$active.removeClass("active");
					}
				} else {
					$dropdown.find("tr:not(.loading-indicator)").first().addClass("active");
				}
				$dropdown.find(".suggestions").jumpIntoView("tr.active");
				onedev.server.inputassist.updateHelp($dropdown);
				$dropdown.align($dropdown.data("alignment"));
				return false;
			}
		});
		
		$input.bind("keydown", "return", function() {
			var $dropdown = $input.data("dropdown");
			if ($dropdown) {
				var $active = $dropdown.find("tr.active");
				if ($active.length != 0) {
					$input.data("update")($active);
					return false;
				} else {
					callback("close");
				}
			}
		});

		var tabbing = false;
		function tab() {
			tabbing = true;
			var $dropdown = $input.data("dropdown");
			if ($dropdown) {
				if ($dropdown.data("inputContent") != $input.val()) {
					setTimeout(tab, 10);
				} else {
					tabbing = false;
					var $active = $dropdown.find("tr.active");
					if ($active.length != 0) 
						$input.data("update")($active);
					else 
						$input.data("update")($dropdown.find("tr").first());
				}
				return false;
			} else {
				tabbing = false;
			}
		};
		$input.bind("keydown", "tab", function() {
			if (!tabbing) {
				return tab();
			} else {
				return false;
			}
		});
	},
	
	markErrors: function(inputId, errors) {
		var $input = $("#" + inputId);
		$input.data("errors", errors);
		var $parent = $input.closest("form");
		$parent.css("position", "relative");
		$parent.find(">.input-error-mark").remove();
		if ($input.val().length != 0) {
			for (var i in errors) {
				var error = errors[i];
				var fromCoord = getCaretCoordinates($input[0], error.from);
				var toCoord = getCaretCoordinates($input[0], error.to+1);
				var $error = $("<div class='input-error-mark'></div>");
				$error.appendTo($parent);
				var inputCoord = $input.offset();
				var parentCoord = $parent.offset();
				var textHeight = 16;
				var errorHeight = 5;
				var errorOffset = 9;
				var minWidth = 5;
				var left = fromCoord.left + inputCoord.left - parentCoord.left;
				var top = fromCoord.top + inputCoord.top - parentCoord.top + textHeight; 
				$error.css({left: left, top: top});
				$error.outerWidth(Math.max(toCoord.left-fromCoord.left, minWidth));
				$error.outerHeight(errorHeight);
			}
		}
	},
	
	assistOpened: function(inputId, dropdownId, inputContent) {
		var $input = $("#" + inputId);
		var $dropdown = $("#" + dropdownId);
		$dropdown.data("trigger", $input);
		$input.data("dropdown", $dropdown);
		$dropdown.on("close", function() {
			$input.data("dropdown", null);
		});
		onedev.server.inputassist.assistUpdated(inputId, dropdownId, inputContent);
	},
	
	assistUpdated: function(inputId, dropdownId, inputContent) {
		var $input = $("#" + inputId);
		var $dropdown = $("#" + dropdownId);
		$dropdown.data("inputContent", inputContent);
		$dropdown.click(function() {
			$input.focus();
		});
		var $item = $dropdown.find("tr");
		$item.click(function() {
			var $this = $(this);
			$input.data("update")($this);
		});
		onedev.server.inputassist.updateHelp($dropdown);
	},
	
	initInfiniteScroll: function(assistId, callback) {
		$("#" + assistId + " .suggestions").scroll(function() {
			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				callback();
			}
		});
	},
	
	updateHelp: function($dropdown) {
		if ($dropdown.find(".help>li").length > 1)
			$dropdown.find(".help").addClass("multiple");
		if ($dropdown.find("tr.active").length != 0) {
			$dropdown.find(".help>.completion").empty().append("Press 'enter' to complete selected item");
		} else {
			$dropdown.find(".help>.completion").empty().append("Press 'tab' to complete first item");
		}
	}
};