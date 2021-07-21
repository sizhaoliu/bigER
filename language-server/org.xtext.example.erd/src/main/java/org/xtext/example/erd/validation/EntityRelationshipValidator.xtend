/*
 * generated by Xtext 2.24.0
 */
package org.xtext.example.erd.validation

import org.xtext.example.erd.entityRelationship.Model
import org.xtext.example.erd.entityRelationship.Entity
import org.xtext.example.erd.entityRelationship.AttributeType
import org.xtext.example.erd.entityRelationship.Attribute
import org.xtext.example.erd.entityRelationship.AttributeType
import org.xtext.example.erd.entityRelationship.EntityRelationshipPackage
import com.google.common.collect.Multimaps
import org.eclipse.xtext.validation.Check

/**
 * This class contains custom validation rules. 
 *
 * See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#validation
 */
class EntityRelationshipValidator extends AbstractEntityRelationshipValidator {

	// Check if entity names are unique
    @Check
	def uniqueEntities(Model model) {
        val entityNames = Multimaps.index(model.entities, [name ?: ''])
        entityNames.keySet.forEach [ name |
			val entitesWithCommonName = entityNames.get(name)
			if (entitesWithCommonName.size > 1) 
				entitesWithCommonName.forEach [
					error('''Multiple entites named '«name»'«»''', it, EntityRelationshipPackage.Literals.ENTITY__NAME)
			]
		]
    }

	// Check if (non-weak) entities contain primary key and no partial key
	@Check
	def containsKey(Model model) {
		val entities = model.entities?.filter[e | !e.weak]
        entities.forEach [ e |

			val attributes = e.attributes?.filter[a | a.type === AttributeType.KEY]
			val keyAttributes = e.attributes?.filter[a | a.type == AttributeType.PARTIAL_KEY]

			if (attributes.size < 1) 
				info('''Strong Entity '«e.name»'«» does not contain a primary key''', e, EntityRelationshipPackage.Literals.ENTITY__NAME)
			if (keyAttributes.size > 0) 
				info('''Strong Entity '«e.name»'«» is not allowed to have a partial key''', e, EntityRelationshipPackage.Literals.ENTITY__NAME)
		]
    }

	// Check if (weak) entities contain partial key and no primary key
	@Check
	def containsPartialKey(Model model) {
		val entities = model.entities?.filter[e | e.weak]
        entities.forEach [ e |
			
			val attributes = e.attributes?.filter[a | a.type == AttributeType.PARTIAL_KEY]
			val keyAttributes = e.attributes?.filter[a | a.type == AttributeType.KEY]

			if (attributes.size < 1) 
				info('''Weak Entity '«e.name»'«» does not contain a partial key''', e, EntityRelationshipPackage.Literals.ENTITY__NAME)
			if (keyAttributes.size > 0) 
				info('''Weak Entity '«e.name»'«» is not allowed to have a primary key''', e, EntityRelationshipPackage.Literals.ENTITY__NAME)
		]
    }

}
