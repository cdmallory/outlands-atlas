import { createErrorMessage, createLoadingMessage } from './utils/errorHandling.js';

interface BestiaryEntry {
    name: string;
    description: string[];
    tips?: string[];
    icon?: string;
}

interface BestiaryLevelData {
    [key: string]: BestiaryEntry[];
}

export class BestiaryMenu {
    private container: HTMLElement;
    private menu: HTMLElement | null = null;
    private currentTab: string = 'Level 6';
    private escapeListener: ((e: KeyboardEvent) => void) | null = null;
    private bestiaryData: { [key: string]: BestiaryLevelData } = {};

    private static readonly TABS = ['Cursed Prevalia', 'Level 6', 'Level 7', 'Level 8'];
    private static readonly ICON_SIZES = {
        large: '60px',
    };

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'bestiary-info-container';
        this.container.style.cssText = `
            position: absolute;
            top: 258px;
            left: 0;
            z-index: 100002;
        `;

        const infoButton = document.createElement('button');
        infoButton.className = 'bestiary-info-button';
        infoButton.style.cssText = `
            background: transparent;
            border: none;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        const buttonImg = document.createElement('img');
        buttonImg.src = '/icons/Bestiary.png';
        buttonImg.style.cssText = `
            width: 70px;
            height: 70px;
            image-rendering: pixelated;
            filter: drop-shadow(0 0 4px #e74c3c)
                   drop-shadow(0 0 8px #e74c3c);
        `;
        infoButton.appendChild(buttonImg);

        infoButton.addEventListener('click', () => {
            buttonImg.style.filter = 'none';
            this.toggleMenu();
        });

        this.container.appendChild(infoButton);
    }

    private createMenu() {
        const backdrop = document.createElement('div');
        backdrop.className = 'bestiary-info-menu-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 400000;
        `;
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.toggleMenu();
            }
        });

        this.menu = document.createElement('div');
        this.menu.className = 'bestiary-info-menu';
        this.menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 400001;
            background: #262626;
            border: 1px solid #e74c3c;
            width: min(1600px, 95vw);
            max-height: 90vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #e74c3c #262626;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            font-size: 0.9em;
            padding: 12px 50px 12px 20px;
        `;

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: none;
            color: #999;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            line-height: 1;
            transition: all 0.2s ease;
            z-index: 400002;
        `;
        closeButton.addEventListener('click', () => this.toggleMenu());
        closeButton.addEventListener('mouseover', () => closeButton.style.color = '#fff');
        closeButton.addEventListener('mouseout', () => closeButton.style.color = '#999');
        this.menu.appendChild(closeButton);

        const content = document.createElement('div');
        content.className = 'bestiary-info-content';
        content.innerHTML = createLoadingMessage();

        this.menu.appendChild(content);
        backdrop.appendChild(this.menu);
        document.body.appendChild(backdrop);

        this.loadContent();
    }

    private async loadContent() {
        const content = this.menu?.querySelector('.bestiary-info-content');
        if (!content) return;

        try {
            // Load bestiary data if not already loaded
            if (Object.keys(this.bestiaryData).length === 0) {
                const response = await fetch('/json/bestiary.json');
                if (!response.ok) {
                    throw new Error(`Failed to load bestiary data: ${response.statusText}`);
                }
                this.bestiaryData = await response.json();
            }

            // Create tabs
            const nav = document.createElement('div');
            nav.className = 'bestiary-tabs';
            nav.style.cssText = `
                display: flex;
                gap: 10px;
                margin-bottom: 12px;
                border-bottom: 1px solid #e74c3c;
                padding-bottom: 8px;
                flex-wrap: wrap;
            `;

            BestiaryMenu.TABS.forEach(tab => {
                const button = document.createElement('button');
                button.textContent = tab;
                button.style.cssText = `
                    background: ${this.currentTab === tab ? '#e74c3c' : 'transparent'};
                    border: 1px solid ${this.currentTab === tab ? '#e74c3c' : '#333'};
                    color: ${this.currentTab === tab ? '#fff' : '#999'};
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.9em;
                `;
                button.addEventListener('click', () => this.showTab(tab));
                button.addEventListener('mouseover', () => {
                    if (this.currentTab !== tab) {
                        button.style.background = '#333';
                        button.style.borderColor = '#444';
                    }
                });
                button.addEventListener('mouseout', () => {
                    if (this.currentTab !== tab) {
                        button.style.background = 'transparent';
                        button.style.borderColor = '#333';
                    }
                });
                nav.appendChild(button);
            });

            content.innerHTML = '';
            content.appendChild(nav);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'bestiary-content';
            contentDiv.style.cssText = 'margin-top: 20px;';

            const tabData = this.bestiaryData[this.currentTab] || {};
            contentDiv.innerHTML = this.createBestiaryContent(tabData);

            content.appendChild(contentDiv);
        } catch (error) {
            console.error('Error loading bestiary data:', error);
            content.innerHTML = createErrorMessage('Error loading bestiary data. Please try again.');
        }
    }

    private showTab(tab: string) {
        this.currentTab = tab;
        this.loadContent();
    }

    private createBestiaryContent(tabData: BestiaryLevelData): string {
        if (Object.keys(tabData).length === 0) {
            return `<div style="color: #999; text-align: center;">No creatures found in ${this.currentTab}</div>`;
        }

        let html = '';

        Object.entries(tabData).forEach(([section, creatures]) => {
            html += `
                <div style="margin-bottom: 24px;">
                    <h2 style="
                        color: #e74c3c;
                        margin: 0 0 16px 0;
                        font-size: 1.2em;
                        border-bottom: 2px solid #e74c3c;
                        padding-bottom: 8px;
                    ">${section}</h2>
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 12px;
                    ">
            `;

            creatures.forEach(creature => {
                html += `
                    <div style="
                        background: #1a1a1a;
                        border: 1px solid #333;
                        border-radius: 4px;
                        padding: 12px;
                        min-width: 0;
                        transition: all 0.2s ease;
                        cursor: pointer;
                    " onmouseover="this.style.background='#262626';this.style.borderColor='#e74c3c';"
                       onmouseout="this.style.background='#1a1a1a';this.style.borderColor='#333';">
                        ${creature.icon ? `<div style="margin-bottom: 8px; text-align: center;">
                            <img src="${creature.icon}" style="height: 40px; image-rendering: pixelated;">
                        </div>` : ''}
                        <h3 style="
                            color: #e74c3c;
                            margin: 0 0 8px 0;
                            font-size: 1em;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        ">${creature.name}</h3>
                        <div style="
                            color: #999;
                            max-height: 120px;
                            overflow-y: auto;
                            font-size: 0.9em;
                            line-height: 1.4;
                            margin-bottom: 8px;
                        ">
                            ${creature.description.map(desc => `<div>${desc}</div>`).join('')}
                        </div>
                        ${creature.tips ? `
                            <div style="
                                background: #0d0d0d;
                                border-left: 3px solid #d4af37;
                                padding: 8px;
                                border-radius: 2px;
                                margin-top: 8px;
                            ">
                                <div style="
                                    color: #d4af37;
                                    font-weight: bold;
                                    font-size: 0.85em;
                                    margin-bottom: 4px;
                                ">💡 Tips</div>
                                <div style="
                                    color: #bbb;
                                    font-size: 0.85em;
                                    line-height: 1.4;
                                ">
                                    ${creature.tips.map(tip => `<div>• ${tip}</div>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        return html;
    }

    public mount(parent: HTMLElement) {
        parent.appendChild(this.container);
    }

    private toggleMenu() {
        if (!this.menu) {
            this.createMenu();
        }

        if (this.menu) {
            const backdrop = this.menu.parentElement;
            if (backdrop) {
                const isVisible = backdrop.style.display === 'block';
                backdrop.style.display = isVisible ? 'none' : 'block';

                const buttonImg = this.container.querySelector('img');

                if (!isVisible) {
                    if (buttonImg) buttonImg.style.filter = 'none';
                    this.escapeListener = (e: KeyboardEvent) => {
                        if (e.key === 'Escape') this.toggleMenu();
                    };
                    document.addEventListener('keydown', this.escapeListener);
                } else {
                    if (this.escapeListener) {
                        document.removeEventListener('keydown', this.escapeListener);
                        this.escapeListener = null;
                    }
                    if (buttonImg) {
                        buttonImg.style.filter = 'drop-shadow(0 0 4px #e74c3c) drop-shadow(0 0 8px #e74c3c)';
                    }
                }
            }
        }
    }
}
