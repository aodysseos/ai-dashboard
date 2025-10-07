import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Dashboard from '../routes/Dashboard'

describe('Dashboard', () => {
  it('renders without crashing', () => {
    render(<Dashboard />)
    expect(screen.getByText('AI Dashboard')).toBeInTheDocument()
  })

  it('displays dashboard content', () => {
    render(<Dashboard />)
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('New Customers')).toBeInTheDocument()
    expect(screen.getByText('Active Accounts')).toBeInTheDocument()
    expect(screen.getByText('Growth Rate')).toBeInTheDocument()
  })
})
