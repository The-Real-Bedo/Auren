import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home Page', () => {
    it('renders the Perpetua welcome message', () => {
        render(<Home />);
        expect(screen.getByText('Welcome to Perpetua')).toBeTruthy();
        expect(screen.getByText('Provide Capital (LP)')).toBeTruthy();
        expect(screen.getByText('Register DApp (Developer)')).toBeTruthy();
    });
});
