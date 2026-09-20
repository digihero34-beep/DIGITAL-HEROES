import React, { forwardRef } from 'react';
import styles from './table.module.css';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', wrapperClassName = '', children, ...props }, ref) => {
    return (
      <div className={`${styles.tableWrapper} ${wrapperClassName}`}>
        <table ref={ref} className={`${styles.table} ${className}`} {...props}>
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <thead ref={ref} className={`${styles.thead} ${className}`} {...props}>
        {children}
      </thead>
    );
  }
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={`${styles.tbody} ${className}`} {...props}>
        {children}
      </tbody>
    );
  }
);
TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isClickable?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tr ref={ref} className={className} {...props}>
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  isNumeric?: boolean;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = '', isNumeric = false, children, ...props }, ref) => {
    const classes = [
      styles.th,
      isNumeric ? styles.thNumeric : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <th ref={ref} className={classes} {...props}>
        {children}
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isNumeric?: boolean;
  isPrimary?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', isNumeric = false, isPrimary = false, children, ...props }, ref) => {
    const classes = [
      styles.td,
      isNumeric ? styles.tdNumeric : '',
      isPrimary ? styles.tdPrimary : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <td ref={ref} className={classes} {...props}>
        {children}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';
