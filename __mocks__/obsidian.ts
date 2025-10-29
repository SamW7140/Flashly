/**
 * Mock Obsidian API for Jest tests
 * Provides minimal implementations of Obsidian classes needed for testing
 */

export class App {
  vault: Vault = new Vault();
  workspace: Workspace = new Workspace();
  metadataCache: MetadataCache = new MetadataCache();
}

export class Vault {
  getAbstractFileByPath(path: string): TFile | null {
    return null;
  }
  
  getMarkdownFiles(): TFile[] {
    return [];
  }
  
  async read(file: TFile): Promise<string> {
    return '';
  }
  
  async modify(file: TFile, data: string): Promise<void> {
    // Mock implementation
  }
}

export class Workspace {
  getActiveFile(): TFile | null {
    return null;
  }
  
  getActiveViewOfType(type: any): any {
    return null;
  }
  
  on(event: string, callback: (...args: any[]) => void): any {
    return { unsubscribe: () => {} };
  }
}

export class MetadataCache {
  getFileCache(file: TFile): CachedMetadata | null {
    return null;
  }
  
  on(event: string, callback: (...args: any[]) => void): any {
    return { unsubscribe: () => {} };
  }
}

export class TFile {
  path: string;
  basename: string;
  extension: string;
  
  constructor(path: string) {
    this.path = path;
    this.basename = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
    this.extension = path.split('.').pop() || '';
  }
}

export interface CachedMetadata {
  frontmatter?: {
    [key: string]: any;
  };
  headings?: HeadingCache[];
  tags?: TagCache[];
}

export interface HeadingCache {
  heading: string;
  level: number;
  position: {
    start: { line: number; col: number; offset: number };
    end: { line: number; col: number; offset: number };
  };
}

export interface TagCache {
  tag: string;
  position: {
    start: { line: number; col: number; offset: number };
    end: { line: number; col: number; offset: number };
  };
}

export class Plugin {
  app: App = new App();
  manifest: any = {};
  
  async loadData(): Promise<any> {
    return {};
  }
  
  async saveData(data: any): Promise<void> {
    // Mock implementation
  }
  
  addCommand(command: any): void {
    // Mock implementation
  }
  
  addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => void): any {
    return {
      addClass: (cls: string) => {},
    };
  }
  
  addStatusBarItem(): any {
    return {
      setText: (text: string) => {},
    };
  }
  
  addSettingTab(tab: any): void {
    // Mock implementation
  }
  
  registerDomEvent(el: any, event: string, callback: any): void {
    // Mock implementation
  }
  
  registerInterval(interval: number): void {
    // Mock implementation
  }
}

export class Modal {
  app: App;
  contentEl: HTMLElement = document.createElement('div');
  
  constructor(app: App) {
    this.app = app;
  }
  
  open(): void {
    // Mock implementation
  }
  
  close(): void {
    // Mock implementation
  }
  
  onOpen(): void {
    // Override in subclass
  }
  
  onClose(): void {
    // Override in subclass
  }
}

export class Notice {
  message: string;
  
  constructor(message: string, timeout?: number) {
    this.message = message;
    // Mock implementation
  }
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement = document.createElement('div');
  
  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
  }
  
  display(): void {
    // Override in subclass
  }
  
  hide(): void {
    // Override in subclass
  }
}

export class Setting {
  settingEl: HTMLElement = document.createElement('div');
  
  constructor(containerEl: HTMLElement) {
    // Mock implementation
  }
  
  setName(name: string): this {
    return this;
  }
  
  setDesc(desc: string): this {
    return this;
  }
  
  addText(callback: (text: any) => void): this {
    callback({
      setPlaceholder: (placeholder: string) => this,
      setValue: (value: string) => this,
      onChange: (callback: (value: string) => void) => this,
    });
    return this;
  }
  
  addToggle(callback: (toggle: any) => void): this {
    callback({
      setValue: (value: boolean) => this,
      onChange: (callback: (value: boolean) => void) => this,
    });
    return this;
  }
  
  addDropdown(callback: (dropdown: any) => void): this {
    callback({
      addOption: (value: string, display: string) => this,
      setValue: (value: string) => this,
      onChange: (callback: (value: string) => void) => this,
    });
    return this;
  }
}

export class Editor {
  getSelection(): string {
    return '';
  }
  
  replaceSelection(text: string): void {
    // Mock implementation
  }
  
  getValue(): string {
    return '';
  }
  
  setValue(text: string): void {
    // Mock implementation
  }
}

export class MarkdownView {
  editor: Editor = new Editor();
  file: TFile | null = null;
  
  getViewType(): string {
    return 'markdown';
  }
}
