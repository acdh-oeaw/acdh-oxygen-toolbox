function applicationStarted(pluginWorkspaceAccess) {
	pathToConfigFile = jsDirURL.toString() + "/config.json";
	configFile = pluginWorkspaceAccess.getUtilAccess().locateFile(new Packages.java.net.URL(pathToConfigFile));
	config = JSON.parse(Packages.com.google.common.io.Files.toString(configFile, Packages.com.google.common.base.Charsets.UTF_8));

	viewCustomizer = {

		customizeView: function (viewInfo) {
			if ("ACDH Tools" == viewInfo.getViewID()) {

				toolsJPane = new Packages.javax.swing.JTabbedPane();
				guiComponents = {};
				for (var i = 0; i < config.length; i++) {
					toolConfig = config[i];
					/* we need a wrapperPanel to stick formelements to the top of oxygens viewinfo */
					wrapperPanel = new Packages.javax.swing.JPanel(new Packages.java.awt.BorderLayout());
					toolPanel = new Packages.javax.swing.JPanel();
					toolPanel.setLayout(new Packages.java.awt.GridBagLayout());
					gridBagConstraints = new Packages.java.awt.GridBagConstraints();
					gridBagConstraints.fill = Packages.java.awt.GridBagConstraints.HORIZONTAL;
					gridBagConstraints.insets = Packages.java.awt.Insets(10, 0, 0, 0);

					if (toolConfig.webservice.endpoint) {
						
						gridBagConstraints.gridx = 0;
						gridBagConstraints.gridy = 0;
					}
					for (var j = 0; j < toolConfig.guicomponents.length; j++) {
						guicomponentprops = toolConfig.guicomponents[j];
						guiComponent = buildGuiElement(guicomponentprops);
						if (guicomponentprops.action) {
							action = guicomponentprops.action;
							type = guicomponentprops.type;
							webserviceprops = toolConfig.webservice;
							buildActionListener(guiComponent, type, action, webserviceprops, pluginWorkspaceAccess);
						}
						if (guicomponentprops.tooltip) {
							guiComponent.setToolTipText(guicomponentprops.tooltip);
						}
						if (guicomponentprops.type !== "button") {
							label = new Packages.javax.swing.JLabel(guicomponentprops.label);
							gridBagConstraints.gridx = 0;
							gridBagConstraints.gridy = j + 1;
							toolPanel.add(label, gridBagConstraints);
						}

						gridBagConstraints.gridx = 1;
						gridBagConstraints.gridy = j + 1;
						guiComponentName = guicomponentprops.name;
						guiComponents[guiComponentName] = guiComponent;
						toolPanel.add(guiComponent, gridBagConstraints);
					};

					wrapperPanel.add(toolPanel, Packages.java.awt.BorderLayout.NORTH);
					toolsJPane.addTab(toolConfig.name, wrapperPanel);
				}

				viewInfo.setComponent(toolsJPane);

			}

		}
	}

	viewCustomizer = new JavaAdapter(Packages.ro.sync.exml.workspace.api.standalone.ViewComponentCustomizer, viewCustomizer);
	pluginWorkspaceAccess.addViewComponentCustomizer(viewCustomizer);
}

function buildGuiElement(guiElementProperties) {

	switch (guiElementProperties.type) {
		case "button":
			javaComponent = new Packages.javax.swing.JButton(guiElementProperties.label);
			javaComponent.setMaximumSize(new Packages.java.awt.Dimension(200, 30));
			return javaComponent;
			break;
		case "textfield":
			if (guiElementProperties.text) {
				javaComponent = new Packages.javax.swing.JTextField();
				javaComponent.setName(guiElementProperties.name);
				javaComponent.setMaximumSize(new Packages.java.awt.Dimension(200, 30));
				javaComponent.setText(guiElementProperties.text);
			}
			return javaComponent;
			break;
		case "select":
			javaComponent = new Packages.javax.swing.JComboBox(guiElementProperties.options);
			javaComponent.setMaximumSize(new Packages.java.awt.Dimension(200, 30));
			return javaComponent;
			break;
		default:
		/* todo */
	}

}

function buildActionListener(guiElement, type, action, webserviceprops, pluginWorkspaceAccess) {

	switch (type) {
		case "button":

			switch (action) {
				case "postwholedocument":

					actionListener = {
						actionPerformed: function (e) {
							try {
								postDoc(pluginWorkspaceAccess, webserviceprops);
							}
							catch (er) {
								Packages.javax.swing.JOptionPane.showMessageDialog(null, er)
							}
						}
					};

					guiElement.addActionListener(new JavaAdapter(Packages.java.awt.event.ActionListener, actionListener));
					break;
				case "postselection":

					actionListener = {
						actionPerformed: function (e) {
							postSelection(pluginWorkspaceAccess, webserviceprops, toolConfig);
						}
					};
					guiElement.addActionListener(new JavaAdapter(Packages.java.awt.event.ActionListener, actionListener));
					break;
				default:

			}
			break;
		default:
	}

}

function postDoc(pluginWorkspaceAccess, webserviceprops) {
	editorAccess = pluginWorkspaceAccess.getCurrentEditorAccess(Packages.ro.sync.exml.workspace.api.standalone.StandalonePluginWorkspace.MAIN_EDITING_AREA);
	currentPage = editorAccess.getCurrentPage();

	try {

		if (currentPage instanceof Packages.ro.sync.exml.workspace.api.editor.page.text.WSTextEditorPage) {
			textEditorPage = currentPage;
			try {
				docAsString = textEditorPage.getTextComponent().getText();
				url = new Packages.java.net.URL(webserviceprops.endpoint);
				connection = url.openConnection();
				for (var i = 0; i < webserviceprops.requestheaders.length; i++) {
					requestHeader = webserviceprops.requestheaders[i];
					connection.setRequestProperty(requestHeader.name, requestHeader.value);
				}
				connection.setRequestMethod(webserviceprops.requestmethod);
				connection.setDoInput(true);
				connection.setDoOutput(true);
				wr = new Packages.java.io.DataOutputStream(connection.getOutputStream());
				wr.writeBytes(docAsString);
				wr.flush();
				wr.close();
				inputStream = connection.getInputStream();
				reader = new Packages.java.io.InputStreamReader(inputStream);
				editorAccess.reloadContent(reader, false);
			} catch (e1) {
				Packages.javax.swing.JOptionPane.showMessageDialog(null, e1);
			}

		}

	} catch (ex) {
		label.setText(ex.printStackTrace());
	}
}

function postSelection(pluginWorkspaceAccess, webserviceprops, toolConfig) {
	
	editorAccess = pluginWorkspaceAccess.getCurrentEditorAccess(Packages.ro.sync.exml.workspace.api.standalone.StandalonePluginWorkspace.MAIN_EDITING_AREA);
	editorAccess.changePage( Packages.ro.sync.exml.editor.EditorPageConstants.PAGE_AUTHOR);
	currentPage = editorAccess.getCurrentPage();

	try {

		if (currentPage instanceof Packages.ro.sync.exml.workspace.api.editor.page.author.WSAuthorEditorPage) {
			textEditorPage = currentPage;
			typeAttributeName = guiComponents['targetattributepos'].getText();
			lemmaAttributeName = guiComponents['targetattributelemma'].getText();
			language = guiComponents['language'].getSelectedItem().toString();
			xPath = guiComponents['xpath'].getText();
			authorDocumentController = currentPage.getDocumentController();
			authorNodes = authorDocumentController.findNodesByXPath(xPath, true, true, true);
			rootNode = authorDocumentController.findNodesByXPath("/", true, true, true);
			/* rhino doesn't support JSON.stringify so we need to construct a string*/
			jsonstring = '{"tokenArray":[';
			parts = [];
			offsets = '';
			for (var i = 0; i < authorNodes.length; i++) {
				textContent = authorNodes[i].getTextContent();
				startOffset = authorNodes[i].getStartOffset();
				trimmedTokenValue = '';
				offsets += startOffset + ',';
				if (authorNodes[i].getType() === Packages.ro.sync.ecss.extensions.api.node.AuthorNode.NODE_TYPE_ELEMENT) {
					authorElement = authorNodes[i];

					children = authorElement.getContentNodes();

					for (var j = 0; j < children.size(); j++) {
						currentChild = children.get(j);
						currentChildName = currentChild.getName();
						currentChildTextContent = currentChild.getTextContent();
						if (Packages.com.google.common.collect.Iterables.contains(elementsToExclude, currentChildName)) {
							textContent = textContent.replace(currentChildTextContent, "");
						}
					}
				}
				trimmedTokenValue = Packages.com.google.common.base.CharMatcher.whitespace().removeFrom(textContent);
				tokenstring = '{"value":"' + trimmedTokenValue + '"}'
				parts.push(tokenstring);
			}
			jsonstring += parts.join(',') + '],"language":"' + language + '","options": {"outputproperties":{"lemma":true,"no-unknown":true}}}';
			try {
				url = new Packages.java.net.URL(webserviceprops.endpoint);
				connection = url.openConnection();
				for (var i = 0; i < webserviceprops.requestheaders.length; i++) {
					requestHeader = webserviceprops.requestheaders[i];
					connection.setRequestProperty(requestHeader.name, requestHeader.value);
				}
				connection.setRequestMethod(webserviceprops.requestmethod);
				connection.setDoInput(true);
				connection.setDoOutput(true);
				wr = new Packages.java.io.DataOutputStream(connection.getOutputStream());

				wr.writeBytes(jsonstring);
				wr.flush();
				wr.close();
				inputStream = connection.getInputStream();
				parsedResult = JSON.parse(Packages.org.apache.commons.io.IOUtils.toString(inputStream, "UTF-8"));

				authorNodesAsList = new Packages.com.google.common.collect.Lists.newArrayList(authorNodes);
				authorDocumentController.disableLayoutUpdate();
				authorDocumentController.beginCompoundEdit();
				try {
					for (var i = 0; i < parsedResult.tokenArray.length; i++) {

						authorElement = authorNodesAsList.get(0);
						token = parsedResult.tokenArray[i];
						typeValue = new Packages.ro.sync.ecss.extensions.api.node.AttrValue(token.type);
						lemmaValue = new Packages.ro.sync.ecss.extensions.api.node.AttrValue(token.lemma);

						authorDocumentController.setAttribute(typeAttributeName, typeValue, authorElement);
						authorDocumentController.setAttribute(lemmaAttributeName, lemmaValue, authorElement);
						authorNodesAsList.remove(0);
					}
				} catch (addLingAnnError) {
					Packages.javax.swing.JOptionPane.showMessageDialog(null, addLingAnnError);
				}
				finally {
					authorDocumentController.endCompoundEdit();
					authorDocumentController.enableLayoutUpdate(rootNode[0]);
				}

			} catch (e1) {
				Packages.javax.swing.JOptionPane.showMessageDialog(null, e1);
			}

		}

	} catch (ex) {
		Packages.javax.swing.JOptionPane.showMessageDialog(null, ex);
	}
}
function applicationClosing(pluginWorkspaceAccess) {

}
