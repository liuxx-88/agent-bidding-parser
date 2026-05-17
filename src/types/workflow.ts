export type WizardStep = 'upload' | 'rag'

export type ParseStep =
  | 'idle'
  | 'uploading'
  | 'storing'
  | 'interacting'
  | 'success'

export type AgentLog = {
  id: number
  text: string
}

export type RagMatch = {
  工艺名称: string
  匹配关键词: string[]
  适用条件: string
  核心要点: string
}

export type ParseResult = {
  project_name: string
  bid_id: string
  geology: string
  milo_path: string
  entities: {
    company: string
    amount: string
    duration: string
  }
  rag_status: string
  matched_standards: string[]
}
