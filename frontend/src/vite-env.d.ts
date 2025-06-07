/// <reference types="vite/client" />

// Chrome Extension API types
declare namespace chrome {
  namespace storage {
    namespace local {
      function get(keys: string | string[] | null): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
      function clear(): Promise<void>;
    }
  }
  
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }
    
    interface CreateProperties {
      url?: string;
      active?: boolean;
    }
    
    function create(createProperties: CreateProperties): Promise<Tab>;
    function query(queryInfo: any): Promise<Tab[]>;
  }
    namespace runtime {
    function getURL(path: string): string;
    function sendMessage(message: any): Promise<any>;
    const lastError: chrome.runtime.LastError | undefined;
  }
}
