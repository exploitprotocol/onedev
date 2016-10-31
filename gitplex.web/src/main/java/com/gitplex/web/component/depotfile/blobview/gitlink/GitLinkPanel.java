package com.gitplex.web.component.depotfile.blobview.gitlink;

import org.apache.wicket.AttributeModifier;
import org.apache.wicket.markup.head.CssHeaderItem;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.link.Link;

import com.gitplex.core.GitPlex;
import com.gitplex.core.manager.ConfigManager;
import com.gitplex.web.component.depotfile.blobview.BlobViewContext;
import com.gitplex.web.component.depotfile.blobview.BlobViewPanel;
import com.gitplex.commons.git.Blob;
import com.gitplex.commons.git.Submodule;

@SuppressWarnings("serial")
public class GitLinkPanel extends BlobViewPanel {

	public GitLinkPanel(String id, BlobViewContext context) {
		super(id, context);
	}
	
	@Override
	protected void onInitialize() {
		super.onInitialize();
		
		Blob blob = context.getDepot().getBlob(context.getBlobIdent());
		Submodule submodule = Submodule.fromString(blob.getText().getContent()); 
		WebMarkupContainer link;
		ConfigManager configManager = GitPlex.getInstance(ConfigManager.class);
		if (submodule.getUrl().startsWith(configManager.getSystemSetting().getServerUrl() + "/")) {
			link = new WebMarkupContainer("link");
			link.add(AttributeModifier.replace("href", submodule.getUrl() + "/browse?revision=" + submodule.getCommitId()));
		} else {
			link = new Link<Void>("link") {

				@Override
				public void onClick() {
				}
				
			};
			link.setEnabled(false);
		}
		link.add(new Label("label", submodule));
		add(link);
	}

	@Override
	public void renderHead(IHeaderResponse response) {
		super.renderHead(response);
		
		response.render(CssHeaderItem.forReference(new GitLinkResourceReference()));
	}

}