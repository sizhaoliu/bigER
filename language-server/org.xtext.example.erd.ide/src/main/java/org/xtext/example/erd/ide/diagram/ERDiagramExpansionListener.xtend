package org.xtext.example.erd.ide.diagram

import org.eclipse.sprotty.Action
import org.eclipse.sprotty.IDiagramExpansionListener
import org.eclipse.sprotty.IDiagramServer
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer

class ERDiagramExpansionListener implements IDiagramExpansionListener {
	
	override expansionChanged(Action action, IDiagramServer server) {
		if (server instanceof LanguageAwareDiagramServer) {
			server.diagramLanguageServer.diagramUpdater.updateDiagram(server)
		}
	}
}