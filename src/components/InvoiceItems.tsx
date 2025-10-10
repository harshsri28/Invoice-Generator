import React from 'react';
import './InvoiceItems.css';

interface InvoiceItem {
  id: number;
  itemName: string;
  itemCost: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

const InvoiceItems: React.FC<InvoiceItemsProps> = ({ items, onItemsChange }) => {
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      itemName: '',
      itemCost: 0
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: number) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: 'itemName' | 'itemCost', value: string | number) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="invoice-items">
      <h2>Invoice Items</h2>
      <div className="items-list">
        {items.map((item, index) => (
          <div key={item.id} className="item-row">
            <div className="item-number">{index + 1}.</div>
            <div className="item-inputs">
              <input
                type="text"
                placeholder="Item name"
                value={item.itemName}
                onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                className="item-name-input"
                required
              />
              <input
                type="number"
                placeholder="Cost"
                value={item.itemCost || ''}
                onChange={(e) => updateItem(item.id, 'itemCost', Number(e.target.value) || 0)}
                className="item-cost-input"
                min="0"
                step="0.01"
                required
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="remove-item-btn"
                disabled={items.length === 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className="add-item-btn">
        Add Item
      </button>
    </div>
  );
};

export default InvoiceItems;