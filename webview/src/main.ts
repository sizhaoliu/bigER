import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';
import '../css/menu-bar.css'

import { Container } from 'inversify';
//import { configureModelElement } from "sprotty";
import {  SprottyLspEditStarter} from 'sprotty-vscode-webview/lib/lsp/editing';
import { createERDiagramContainer } from './di.config';
import { SprottyDiagramIdentifier, VscodeDiagramWidget,  } from 'sprotty-vscode-webview'
//import { PaletteButtonView, DiagramNameView } from './html-views';
//import { ERDiagramWidget, ERDiagramServer, AddWithWorkspaceEditAction, AddWithWorkspaceEditCommand } from './toolbar';
// VscodeDiagramWidget
//import { configureCommand, CreateElementCommand } from 'sprotty';
//import {  PaletteButtonView } from './html-views';
import { AddRelationshipWithWorkspaceEditCommand, AddWithWorkspaceEditCommand, ERDiagramWidget } from './toolbar';
import { configureCommand } from 'sprotty';

export class ERDiagramSprottyStarter extends SprottyLspEditStarter {
    

    createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createERDiagramContainer(diagramIdentifier.clientId);
    }

    protected addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        container.rebind(VscodeDiagramWidget).to(ERDiagramWidget).inSingletonScope();
        configureCommand(container, AddWithWorkspaceEditCommand);
        configureCommand(container, AddRelationshipWithWorkspaceEditCommand);
    }
}

new ERDiagramSprottyStarter();





