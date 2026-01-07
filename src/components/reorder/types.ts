export interface ReorderableItem {
  id: string;
  display_order: number;
  [key: string]: any;
}

export interface ReorderConfig<T extends ReorderableItem> {
  title: string;
  tableName: string;
  displayField: keyof T;
  idField: keyof T;
  orderField: keyof T;
  emptyMessage: string;
  emptySubMessage: string;
  dragMessage: string;
}

export interface ReorderProps<T extends ReorderableItem> {
  items: T[];
  config: ReorderConfig<T>;
  onSuccess: () => void;
  renderItem?: (item: T, index: number) => React.ReactNode;
  filterComponent?: React.ReactNode;
}

export type ReorderMode = 'drag' | 'bulk' | 'swap';