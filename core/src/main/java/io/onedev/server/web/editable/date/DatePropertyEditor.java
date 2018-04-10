package io.onedev.server.web.editable.date;

import java.lang.reflect.Method;
import java.util.Date;

import org.apache.wicket.AttributeModifier;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.form.AjaxFormComponentUpdatingBehavior;
import org.apache.wicket.markup.html.form.FormComponent;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.Model;
import org.apache.wicket.util.convert.ConversionException;

import de.agilecoders.wicket.extensions.markup.html.bootstrap.form.DateTextField;
import de.agilecoders.wicket.extensions.markup.html.bootstrap.form.DateTextFieldConfig;
import io.onedev.server.util.editable.EditableUtils;
import io.onedev.server.util.editable.annotation.OmitName;
import io.onedev.server.web.editable.ErrorContext;
import io.onedev.server.web.editable.PathSegment;
import io.onedev.server.web.editable.PropertyDescriptor;
import io.onedev.server.web.editable.PropertyEditor;

@SuppressWarnings("serial")
public class DatePropertyEditor extends PropertyEditor<Date> {

	private FormComponent<Date> input;
	
	public DatePropertyEditor(String id, PropertyDescriptor propertyDescriptor, IModel<Date> propertyModel) {
		super(id, propertyDescriptor, propertyModel);
	}

	@Override
	protected void onInitialize() {
		super.onInitialize();
		
		DateTextFieldConfig config = new DateTextFieldConfig();
		config.autoClose(true);
		config.clearButton(true);
		config.withFormat(DateEditSupport.DATE_INPUT_FORMAT);
		input = new DateTextField("input", Model.of(getModelObject()), config);
		input.setType(getPropertyDescriptor().getPropertyClass());
		Method propertyGetter = getPropertyDescriptor().getPropertyGetter();
		if (propertyGetter.getAnnotation(OmitName.class) != null)
			input.add(AttributeModifier.replace("placeholder", EditableUtils.getDisplayName(propertyGetter)));

		input.setLabel(Model.of(getPropertyDescriptor().getDisplayName(this)));
		
		input.add(new AjaxFormComponentUpdatingBehavior("change"){

			@Override
			protected void onUpdate(AjaxRequestTarget target) {
				onPropertyUpdating(target);
			}
			
		});
		
		add(input);
	}

	@Override
	public ErrorContext getErrorContext(PathSegment pathSegment) {
		return null;
	}

	@Override
	protected Date convertInputToValue() throws ConversionException {
		return input.getConvertedInput();
	}

}
