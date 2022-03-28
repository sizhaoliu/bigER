/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, RectangularNodeView, SNode, SEdge, Point, PolylineEdgeView, toDegrees, ExpandButtonView, findParentByFeature, isExpandable,
         svg, SButton, SPort, IView, SLabel, IViewArgs } from 'sprotty';

import { injectable } from 'inversify';

export class EntityView extends RectangularNodeView {
    render(node: Readonly<SNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const rhombStr = "M 0,38  L " + node.bounds.width + ",38";
        return <g>
            <rect class-sprotty-node={true} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" rx="5" ry="5" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)}></rect>
            {context.renderChildren(node)} 
            {(node.children[1] && node.children[1].children.length > 0) ?
                <path class-comp-separator={true} d={rhombStr}></path> : ""}
        </g>;
    }
}

@injectable()
export class InheritanceEdgeView extends PolylineEdgeView {
    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        
        return [
            <path class-sprotty-edge-arrow={true} d="M 6,-3 L 0,0 L 6,3 Z"
            transform={`rotate(${angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }
}

export function angle(x0: Point, x1: Point): number {
    return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
}

@injectable()
export class ExpandEntityView extends ExpandButtonView {
    render(button: SButton, context: RenderingContext): VNode {
        const expandable = findParentByFeature(button, isExpandable);
        const path = (expandable !== undefined && expandable.expanded)
            ? 'M18 15l-6-6-6 6'
            : 'M6 9l6 6 6-6';
        return <g class-sprotty-button="{true}" class-enabled="{button.enabled}">
                <rect x={0} y={0} width={16} height={16} opacity={0}></rect>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" strokeLinejoin="bevel"><path d={path}/></svg>
            </g>;
    }
}



@injectable()
export class PolylineArrowEdgeView extends PolylineEdgeView {

    notation:String;
    cardinality:String;
    isLeft:Boolean;

    render(edge: Readonly<SEdge>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        const route = this.edgeRouterRegistry.route(edge, args);
        if (route.length === 0) {
            return this.renderDanglingEdge("Cannot compute route", edge, context);
        }
        if (!this.isVisible(edge, route, context)) {
            if (edge.children.length === 0) {
                return undefined;
            }
            // The children of an edge are not necessarily inside the bounding box of the route,
            // so we need to render a group to ensure the children have a chance to be rendered.
            return <g>{context.renderChildren(edge, { route })}</g>;
        }

        var showLabel = true;

        edge.children.forEach((child) =>{
            if(child instanceof SLabel){
                if (child.text.includes('BACH:')){
                    showLabel = false;
                }
            }
        })

        if(showLabel){
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, route, context, args)}
            {this.renderAdditionals(edge, route, context)}
            {context.renderChildren(edge, { route })}
        </g>;
        }else{
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, route, context, args)}
            {this.renderAdditionals(edge, route, context)}
        </g>;
        }
    }

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {


        edge.children.forEach((child)=>{
            if(child instanceof SLabel){

                if(child.text.includes('BACH:') || (child.text.length === 0 && this.notation === 'BACH')){
                    this.cardinality = child.text.substring(7,child.text.length)
                    this.notation = 'BACH';

                    if(child.text.includes('F:')){
                        this.isLeft = true;
                    }else{
                        this.isLeft = false;
                    }
                }else{
                    this.notation = 'CHEN';
                    this.cardinality = child.text
                }
            }
        })

        const source = segments[0];
        const target = segments[segments.length - 1];
        const nextToLast = segments[segments.length - 2];
        const secondElem = segments[1];

        var arrowSourceX = source.x;
        var arrowTargetX = target.x;

        if(this.notation === 'BACH'){

            if(!isNaN(arrowSourceX)){
                arrowSourceX = arrowSourceX + 9;
            }
            if(!isNaN(arrowTargetX)){
                arrowTargetX = arrowTargetX + 9;
            }
            console.log('cardi: '+this.cardinality)
            switch(this.cardinality){
                case '0':  if(this.isLeft){
                                return [
                                    <svg>
                                        <circle cx={source.x} cy={source.y} r="7" stroke-width="1" fill="black" />
                                    </svg>
                                ];
                            }else{
                                return [
                                    <svg>
                                        <circle cx={target.x} cy={target.y} r="7" stroke-width="1" fill="black" />
                                    </svg>
                                ];
                            }
                case '0+':  if(this.isLeft){
                                return [
                                    <svg>
                                        <circle cx={source.x} cy={source.y} r="7" stroke-width="1" fill="black" />
                                        <path class-sprotty-edge-arrow={true} d="M 7,-4 L 0,0 L 7,4 Z"
                                            transform={`rotate(${this.angle(source, secondElem)} ${source.x} ${source.y}) translate(${arrowSourceX} ${source.y})`}/>
                                    </svg>
                                ];
                            }else{
                                return [
                                    <svg>
                                        <circle cx={target.x} cy={target.y} r="7" stroke-width="1" fill="black" />
                                        <path class-sprotty-edge-arrow={true} d="M 7,-4 L 0,0 L 7,4 Z"
                                            transform={`rotate(${this.angle(target, nextToLast)} ${target.x} ${target.y}) translate(${arrowTargetX} ${target.y})`}/>
                                    </svg>
                                ];
                            }
                case '1':  if(this.isLeft){
                                return [
                                    <svg>
                                        <circle cx={source.x} cy={source.y} r="7" stroke-width="1" fill="var(--vscode-editorActiveLineNumber-foreground)" />
                                    </svg>
                                ];
                            }else{
                                return [
                                    <svg>
                                        <circle cx={target.x} cy={target.y} r="7" stroke-width="1" fill="var(--vscode-editorActiveLineNumber-foreground)" />
                                    </svg>
                                ];
                            }
                case '1+':  if(this.isLeft){
                                return [
                                    <svg>
                                        <circle cx={source.x} cy={source.y} r="7" stroke-width="1" fill="var(--vscode-editorActiveLineNumber-foreground)" />
                                        <path class-sprotty-edge-arrow={true} d="M 7,-4 L 0,0 L 7,4 Z"
                                            transform={`rotate(${this.angle(source, secondElem)} ${source.x} ${source.y}) translate(${arrowSourceX} ${source.y})`}/>
                                    </svg>
                                ];
                            }else{
                                return [
                                    <svg>
                                        <circle cx={target.x} cy={target.y} r="7" stroke-width="1" fill="var(--vscode-editorActiveLineNumber-foreground)" />
                                        <path class-sprotty-edge-arrow={true} d="M 7,-4 L 0,0 L 7,4 Z"
                                            transform={`rotate(${this.angle(target, nextToLast)} ${target.x} ${target.y}) translate(${arrowTargetX} ${target.y})`}/>
                                    </svg>
                                ];
                            }
                default:  return [];
            }
        }else{
            return [];
        }
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}

@injectable()
export class TriangleButtonView implements IView {
    render(model: SPort, context: RenderingContext): VNode {
        return <g class-sprotty-button="{true}">
                <rect x={-15} y={-15} width={50} height={50} opacity={0}></rect>
                <svg width="35" height="35" viewBox="0 -20 32 32" xmlns="http://www.w3.org/2000/svg" fill="#89d185"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.306 2.146l-4.02 4.02v.708l4.02 4.02.708-.707L3.807 6.98H5.69c2.813 0 4.605.605 5.705 1.729 1.102 1.125 1.615 2.877 1.615 5.421v.35h1v-.35c0-2.646-.527-4.72-1.9-6.121C10.735 6.605 8.617 5.98 5.69 5.98H3.887l3.127-3.126-.708-.708z"/></svg>
            </g>
        //return <div class-codicon={true} class-codicon-reply={true}></div>
    //return <path class-sprotty-button={true} className={codiconCSSClasses('reply', false, false)} d="M 0,0 L 8,4 L 0,8 Z"/>
    }
    
}

