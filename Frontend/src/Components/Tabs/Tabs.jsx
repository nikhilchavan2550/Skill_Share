import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Tabs.css';

const TabContext = React.createContext(null);

export const Tabs = ({ 
  children, 
  defaultTab, 
  onChange,
  variant = 'default',
  align = 'start',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || '');

  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const contextValue = {
    activeTab,
    onTabChange: handleTabChange,
    variant,
    align
  };

  return (
    <TabContext.Provider value={contextValue}>
      <div className={`tabs-container ${className}`}>
        {children}
      </div>
    </TabContext.Provider>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTab: PropTypes.string,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills', 'underline', 'bordered']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  className: PropTypes.string,
};

export const TabList = ({ children, className = '' }) => {
  const { variant, align } = React.useContext(TabContext);
  
  const tabListClasses = `
    tab-list 
    tab-${variant} 
    tab-align-${align}
    ${className}
  `.trim();
  
  return <div className={tabListClasses}>{children}</div>;
};

TabList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const Tab = ({ 
  id, 
  label, 
  icon,
  disabled = false,
  className = ''
}) => {
  const { activeTab, onTabChange } = React.useContext(TabContext);
  const isActive = activeTab === id;
  
  const tabClasses = `
    tab 
    ${isActive ? 'tab-active' : ''} 
    ${disabled ? 'tab-disabled' : ''} 
    ${className}
  `.trim();
  
  const handleClick = () => {
    if (!disabled) {
      onTabChange(id);
    }
  };
  
  return (
    <button
      className={tabClasses}
      onClick={handleClick}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      id={`tab-${id}`}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
    >
      {icon && <span className="tab-icon">{icon}</span>}
      {label && <span className="tab-label">{label}</span>}
    </button>
  );
};

Tab.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export const TabPanels = ({ children, className = '' }) => {
  return <div className={`tab-panels ${className}`}>{children}</div>;
};

TabPanels.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const TabPanel = ({ id, children, className = '' }) => {
  const { activeTab } = React.useContext(TabContext);
  const isActive = activeTab === id;
  
  if (!isActive) return null;
  
  return (
    <div 
      className={`tab-panel ${className}`}
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
    >
      {children}
    </div>
  );
};

TabPanel.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};
