export interface PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
}

export enum QItemType {
  Group = 'group',
  String = 'string',
  Boolean = 'boolean'
}