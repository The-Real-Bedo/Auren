import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home Page', () => {
    it('renders the Auren headline and CTAs', () => {
        render(<Home />);
        expect(screen.getAllByText('AUREN').length).toBeGreaterThan(0);
        expect(screen.getByText('The economic layer for autonomous applications.')).toBeTruthy();
        expect(screen.getAllByText(/Try Auren/i).length).toBeGreaterThan(0);
        expect(screen.getByText('Watch an Agent Execute')).toBeTruthy();
    });
});
