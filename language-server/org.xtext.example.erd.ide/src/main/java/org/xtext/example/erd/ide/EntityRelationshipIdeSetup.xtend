/*
 * generated by Xtext 2.24.0
 */
package org.xtext.example.erd.ide

import com.google.inject.Guice
import org.eclipse.xtext.util.Modules2
import org.xtext.example.erd.EntityRelationshipRuntimeModule
import org.xtext.example.erd.EntityRelationshipStandaloneSetup
import org.xtext.example.erd.ide.diagram.ERDiagramModule

/**
 * Initialization support for running Xtext languages as language servers.
 */
class EntityRelationshipIdeSetup extends EntityRelationshipStandaloneSetup {

	override createInjector() {
		Guice.createInjector(Modules2.mixin(new EntityRelationshipRuntimeModule, new EntityRelationshipIdeModule,
		 new ERDiagramModule))
	}
	
}
