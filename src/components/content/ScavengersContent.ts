import { GeneralContent, GeneralItemData, CreateIconContainer } from '../types/InfoMenuTypes.js';
import { createCard, createGrid, createSection, CardData } from '../utils/uiHelpers.js';

export function createScavengersContent(data: GeneralContent, createIconContainer: CreateIconContainer): string {
    const createScavengerCard = (item: GeneralItemData): CardData => {
        return {
            title: item.name,
            subtitle: '',
            description: item.description,
            //icon: `/icons/ScavFood.png`,}`,
            location: `Location: ${item.location}`,
            customIcons: undefined
        };
    };

    return Object.entries(data).map(([category, items]) => {
        const cards = items.map(item => createCard(createScavengerCard(item), createIconContainer));
        const grid = createGrid(cards);
        const section = createSection(category, grid);

        return `
            <div class="scavengers-content" style="display: flex; flex-direction: column; gap: 20px;">
                ${section}
            </div>
        `;
    }).join('');
}
