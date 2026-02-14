import type { AgentType } from './agents';

export interface PageContext {
  url: string;
  domain: string;
  pageTitle: string;
  nearestHeader: string | null;
  favicon?: string;
}

export interface ProcessRequest {
  type: 'PROCESS_TEXT';
  payload: {
    agentType: AgentType;
    text: string;
    lang: string;
    apiKey: string;
    userContext?: string;
    context?: PageContext;
  };
}

export interface OpenSidePanelRequest {
  type: 'OPEN_SIDE_PANEL';
  payload: {
    text: string;
    context?: PageContext;
  };
}

export interface TextSelectedMessage {
  type: 'TEXT_SELECTED';
  payload: {
    text: string;
    context?: PageContext;
  };
}
