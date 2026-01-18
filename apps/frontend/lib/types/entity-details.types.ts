export interface EntityDetailField<T> {
  key: keyof T;
  label: string;
  icon?: React.ReactNode;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
  onClick?: (value: T[keyof T], record: T) => void;
  copyable?: boolean;
  hideIfEmpty?: boolean;
  span?: 1 | 2 | 3;
}

export interface EntityDetailSection<T> {
  title?: string;
  description?: string;
  fields: EntityDetailField<T>[];
}

export interface EntityDetailConfig<T> {
  columns?: 2 | 3;
  sections: EntityDetailSection<T>[];
}
