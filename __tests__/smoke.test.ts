/**
 * Smoke test to verify Jest setup is working correctly
 */

import { createMockPlugin, createMockTFile } from './setup';

describe('Jest Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should create mock TFile', () => {
    const file = createMockTFile('test.md', '# Test');
    expect(file.path).toBe('test.md');
    expect(file.basename).toBe('test');
    expect(file.extension).toBe('md');
  });

  it('should create mock plugin', () => {
    const plugin = createMockPlugin();
    expect(plugin).toBeDefined();
    expect(plugin.app).toBeDefined();
    expect(plugin.loadData).toBeDefined();
    expect(plugin.saveData).toBeDefined();
  });
});

describe('Card Model', () => {
  it('should import card module', async () => {
    const cardModule = await import('../src/models/card');
    // If this doesn't throw, the import works
    expect(cardModule.createFlashlyCard).toBeDefined();
    expect(cardModule.getCardStateLabel).toBeDefined();
  });
});
