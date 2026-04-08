import { GeneralContent, GeneralItemData, CreateIconContainer } from '../types/InfoMenuTypes.js';
import { createCard, createGrid, createSection, CardData } from '../utils/uiHelpers.js';

interface ScavengerItemData extends GeneralItemData {
    icon?: string[];
    scale?: number;
}

export function createScavengersContent(data: GeneralContent, createIconContainer: CreateIconContainer): string {
    const createScavengerCard = (item: ScavengerItemData): CardData => {
        const customIcons = item.icon ? `
            <div style="display: flex; justify-content: center; align-items: center; width: 100%; padding: 10px;">
                <div style="width: 640px; height: 640px; display: flex; justify-content: center; align-items: center;">
                    <img src="${item.icon[0]}" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
            </div>
        ` : undefined;

        return {
            title: item.name,
            subtitle: '',
            description: item.description,
            location: `Location: ${item.location}`,
            customIcons: customIcons
        };
    };

    return Object.entries(data).map(([category, items]) => {
        const cards = items.map(item => createCard(createScavengerCard(item as ScavengerItemData), createIconContainer));
        const grid = `
            <div class="scavengers-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(720px, 1fr)); gap: 12px;">
                ${cards.join('')}
            </div>
        `;
        const section = createSection(category, grid);

        return `
            <div class="scavengers-content" style="display: flex; flex-direction: column; gap: 20px;">
                ${section}
            </div>
        `;
    }).join('');
}
