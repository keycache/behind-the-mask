import type { TextSettings } from '../types/editor';
import { updateTexts } from './ImageProcessor';

let texts: TextSettings[] = [];
let currentId = 0;

function updateTextOverlay(textSettings: TextSettings) {
    const textOverlay = document.getElementById('text-overlay');
    const imagePreview = document.getElementById('image-preview') as HTMLImageElement;

    let textElement = document.querySelector(`[data-text-id="${textSettings.id}"]`) as HTMLDivElement;
    if (!textElement) {
        textElement = document.createElement('div');
        textElement.className = 'absolute text-center pointer-events-none';
        textElement.dataset.textId = textSettings.id;
        textOverlay?.appendChild(textElement);
    }

    // Update text content and basic styles
    textElement.textContent = textSettings.content;
    textElement.style.fontFamily = textSettings.fontFamily;
    
    // Scale font size relative to image height
    let imageHeight = imagePreview.height || 1000;
    const scaleFactor = imageHeight / 1000;
    const scaledFontSize = textSettings.fontSize * scaleFactor;
    textElement.style.fontSize = `${scaledFontSize}px`;
    
    textElement.style.color = textSettings.color;
    textElement.style.zIndex = textSettings.z.toString();

    // Set initial position at center
    textElement.style.position = 'absolute';
    textElement.style.left = '50%';
    textElement.style.top = '50%';
    
    // Get image dimensions for scaling
    const imageWidth = imagePreview.width;
    imageHeight = imagePreview.height;
    
    // Calculate pixel offsets based on percentages
    const xOffset = (textSettings.x / 100) * imageWidth;
    const yOffset = (textSettings.y / 100) * imageHeight;
    
    // Apply transform with pixel-based offsets
    textElement.style.transform = `
        translate(-50%, -50%)
        translate(${xOffset}px, ${yOffset}px)
        rotate(${textSettings.rotation}deg)
    `;

    // Update displays
    const panel = document.querySelector(`[data-panel-id="${textSettings.id}"]`);
    if (panel) {
        const rotationDisplay = panel.querySelector('.rotation-value');
        if (rotationDisplay) {
            rotationDisplay.textContent = `${textSettings.rotation}°`;
        }

        const zIndexDisplay = panel.querySelector('.z-index-value');
        if (zIndexDisplay) {
            zIndexDisplay.textContent = textSettings.z.toString();
        }

        const xPosDisplay = panel.querySelector('.x-position-value');
        if (xPosDisplay) {
            xPosDisplay.textContent = `${textSettings.x}%`;
        }

        const yPosDisplay = panel.querySelector('.y-position-value');
        if (yPosDisplay) {
            yPosDisplay.textContent = `${textSettings.y}%`;
        }

        const fontSizeDisplay = panel.querySelector('.font-size-value');
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = `${textSettings.fontSize}px`;
        }
    }
}

function setupPanelEventListeners(panel: HTMLElement, textSettings: TextSettings) {
    // Collapse button handler
    const collapseBtn = panel.querySelector('.collapse-btn');
    const settingsContent = panel.querySelector('.settings-content');
    let isCollapsed = false;

    collapseBtn?.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        if (settingsContent) {
            settingsContent.classList.toggle('hidden', isCollapsed);
            // Rotate arrow icon
            collapseBtn.classList.toggle('rotate-180', isCollapsed);
        }
    });

    // Text Content
    const textInput = panel.querySelector('.text-content') as HTMLInputElement;
    textInput?.addEventListener('input', (e) => {
        textSettings.content = (e.target as HTMLInputElement).value;
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // X Position
    const xPosition = panel.querySelector('.x-position') as HTMLInputElement;
    xPosition?.addEventListener('input', (e) => {
        textSettings.x = parseInt((e.target as HTMLInputElement).value);
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Y Position
    const yPosition = panel.querySelector('.y-position') as HTMLInputElement;
    yPosition?.addEventListener('input', (e) => {
        textSettings.y = parseInt((e.target as HTMLInputElement).value);
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Z Index
    const zIndex = panel.querySelector('.z-index') as HTMLInputElement;
    zIndex?.addEventListener('input', (e) => {
        textSettings.z = parseInt((e.target as HTMLInputElement).value);
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Font Size
    const fontSize = panel.querySelector('.font-size') as HTMLInputElement;
    fontSize?.addEventListener('input', (e) => {
        textSettings.fontSize = parseInt((e.target as HTMLInputElement).value);
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Font Family
    const fontFamily = panel.querySelector('.font-family') as HTMLSelectElement;
    fontFamily?.addEventListener('change', (e) => {
        textSettings.fontFamily = (e.target as HTMLSelectElement).value;
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Color
    const color = panel.querySelector('.text-color') as HTMLInputElement;
    color?.addEventListener('input', (e) => {
        textSettings.color = (e.target as HTMLInputElement).value;
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Rotation
    const rotation = panel.querySelector('.rotation') as HTMLInputElement;
    rotation?.addEventListener('input', (e) => {
        textSettings.rotation = parseInt((e.target as HTMLInputElement).value);
        updateTextOverlay(textSettings);
        updateTexts(texts);
    });

    // Delete Button
    const deleteBtn = panel.querySelector('.delete-text-btn');
    deleteBtn?.addEventListener('click', () => {
        const textElement = document.querySelector(`[data-text-id="${textSettings.id}"]`);
        textElement?.remove();
        panel.remove();
        texts = texts.filter(t => t.id !== textSettings.id);
        updateTexts(texts);
    });
}

function createTextPanel(textId: string) {
    const panel = document.createElement('div');
    panel.dataset.panelId = textId;
    
    panel.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center space-x-2">
                    <button class="collapse-btn w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-transform duration-200 transform rotate-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Text Settings</h3>
                </div>
                <button class="delete-text-btn text-red-600 hover:text-red-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div class="mb-4">
                <input type="text" class="text-content w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white" placeholder="Enter text" value="Sample Text" />
            </div>

            <div class="settings-content space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">X Position</label>
                    <input type="range" class="x-position w-full" min="-50" max="150" value="0" />
                    <div class="text-sm text-gray-500 dark:text-gray-400 text-center x-position-value">0%</div>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Y Position</label>
                    <input type="range" class="y-position w-full" min="-50" max="150" value="0" />
                    <div class="text-sm text-gray-500 dark:text-gray-400 text-center y-position-value">0%</div>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Z Index</label>
                    <input type="range" class="z-index w-full" min="0" max="10" value="0" />
                    <div class="text-sm text-gray-500 dark:text-gray-400 text-center z-index-value">0</div>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
                    <input type="range" class="font-size w-full" min="12" max="120" value="48" />
                    <div class="text-sm text-gray-500 dark:text-gray-400 text-center font-size-value">48px</div>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</label>
                    <select class="font-family w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white">
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                    <input type="color" class="text-color w-full h-10 p-1 rounded-md border border-gray-300 dark:border-gray-600" value="#000000" />
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rotation</label>
                    <input type="range" class="rotation w-full" min="-180" max="180" value="0" />
                    <div class="text-sm text-gray-500 dark:text-gray-400 text-center rotation-value">0°</div>
                </div>
            </div>
        </div>
    `;
    
    const textSettings = {
        id: textId,
        content: 'Sample Text',
        x: 0,
        y: 0,
        z: 0,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
    };
    
    texts.push(textSettings);
    updateTextOverlay(textSettings);
    setupPanelEventListeners(panel, textSettings);
    
    return panel;
}

export function setupTextOverlay() {
    const addTextBtn = document.getElementById('add-text-btn');
    const textPanels = document.getElementById('text-panels');

    // Add Text Button Handler
    addTextBtn?.addEventListener('click', () => {
        const textId = `text-${currentId++}`;
        const panel = createTextPanel(textId);
        textPanels?.appendChild(panel);
    });
}
