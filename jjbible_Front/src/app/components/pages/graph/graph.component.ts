import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import cytoscape from 'cytoscape';
import { TechniqueService } from '@services';
import { TechniqueGraph, GraphNode } from '@models';

type LayoutName = 'breadthfirst' | 'cose' | 'circle' | 'grid';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cy', { static: false }) cyRef!: ElementRef<HTMLDivElement>;

  graph: TechniqueGraph = { nodes: [], edges: [] };
  loading = true;
  error = '';
  layout: LayoutName = 'breadthfirst';

  private cy: any = null;
  private viewReady = false;

  constructor(private techniqueService: TechniqueService) {}

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.tryRender();
  }

  ngOnDestroy() {
    if (this.cy) this.cy.destroy();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.techniqueService.getGraph().subscribe({
      next: g => {
        this.graph = g;
        this.loading = false;
        this.tryRender();
      },
      error: () => {
        this.error = 'Impossible de charger le graphe';
        this.loading = false;
      }
    });
  }

  private tryRender() {
    if (!this.viewReady || this.loading) return;
    this.render();
  }

  private nodeColor(n: GraphNode): string {
    switch (n.niveau_maitrise) {
      case 'maitrise':
        return '#10b981';
      case 'en_cours':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  }

  private render() {
    if (!this.cyRef) return;
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }

    const elements: any[] = [];
    for (const n of this.graph.nodes) {
      elements.push({
        data: {
          id: 'n' + n.id,
          label: n.nom,
          color: this.nodeColor(n),
          fav: n.favori ? 1 : 0
        }
      });
    }
    for (const e of this.graph.edges) {
      elements.push({
        data: {
          id: 'e' + e.id,
          source: 'n' + e.source,
          target: 'n' + e.cible,
          label: e.type === 'variation' ? 'equivaut' : e.type,
          variation: e.type === 'variation' ? 1 : 0
        }
      });
    }

    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            color: '#1a1a1a',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            width: 28,
            height: 28,
            'border-width': 2,
            'border-color': '#ffffff'
          }
        },
        {
          selector: 'node[fav = 1]',
          style: { 'border-color': '#fbbf24', 'border-width': 3 }
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '9px',
            color: '#475569',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-background-padding': '2px'
          }
        },
        {
          selector: 'edge[variation = 1]',
          style: {
            'line-style': 'dashed',
            'line-color': '#a855f7',
            'target-arrow-shape': 'none',
            color: '#7e22ce'
          }
        },
        {
          selector: '.faded',
          style: { opacity: 0.15 }
        },
        {
          selector: '.highlight',
          style: { 'line-color': '#1e63d6', 'target-arrow-color': '#1e63d6', width: 3 }
        }
      ],
      layout: this.layoutOptions()
    });

    // Clic sur un noeud : met en evidence ses voisins
    this.cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const neighborhood = node.closedNeighborhood();
      this.cy.elements().addClass('faded');
      neighborhood.removeClass('faded');
      neighborhood.edges().addClass('highlight');
    });

    // Clic sur le fond : reinitialise
    this.cy.on('tap', (evt: any) => {
      if (evt.target === this.cy) {
        this.cy.elements().removeClass('faded').removeClass('highlight');
      }
    });
  }

  private layoutOptions() {
    if (this.layout === 'breadthfirst') {
      return { name: 'breadthfirst', directed: true, spacingFactor: 1.3, padding: 25 } as any;
    }
    if (this.layout === 'cose') {
      return { name: 'cose', padding: 25, animate: false } as any;
    }
    return { name: this.layout, padding: 25 } as any;
  }

  relayout() {
    if (this.cy) this.cy.layout(this.layoutOptions()).run();
  }

  fit() {
    if (this.cy) this.cy.fit(undefined, 30);
  }
}
