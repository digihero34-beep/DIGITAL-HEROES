'use client';

import React, { useState } from 'react';
import styles from './tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || items[0]?.id || '');

  function handleTabClick(id: string) {
    setActiveTab(id);
    onChange?.(id);
  }

  const currentItem = items.find((item) => item.id === activeTab) || items[0];

  return (
    <div className={className}>
      <div className={styles.tabList} role="tablist">
        {items.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              type="button"
              className={`${styles.tabButton} ${isActive ? styles.tabActive : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ marginLeft: 6, fontSize: '0.78rem', opacity: 0.8 }}>
                  ({item.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {currentItem && (
        <div
          role="tabpanel"
          id={`panel-${currentItem.id}`}
          aria-labelledby={`tab-${currentItem.id}`}
          className={styles.tabPanel}
        >
          {currentItem.content}
        </div>
      )}
    </div>
  );
}
