import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

const renderDropdown = (id) => `
  <div class="dropdown">
    <button id="${id}-toggle" data-ui-toggle="dropdown" aria-expanded="false">Theme</button>
    <ul class="dropdown-menu">
      <li><a id="${id}-option" href="#" data-bs-theme-value="light">Light</a></li>
    </ul>
  </div>
`

const click = (element) => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

describe('uiInteractions', () => {
  beforeAll(async () => {
    await import('./uiInteractions.js')
  })

  beforeEach(async () => {
    document.body.innerHTML = `
      <button id="nav-toggle" data-ui-toggle="collapse" data-ui-target="#navigation"
        aria-expanded="false">Navigation</button>
      <div id="navigation" class="collapse navbar-collapse"></div>
      ${renderDropdown('first')}
      ${renderDropdown('second')}
      <button id="outside">Outside</button>
    `
  })

  it('toggles the responsive navigation and keeps aria-expanded in sync', () => {
    const toggle = document.querySelector('#nav-toggle')
    const navigation = document.querySelector('#navigation')

    click(toggle)
    expect(navigation.classList.contains('show')).toBe(true)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    click(toggle)
    expect(navigation.classList.contains('show')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens a dropdown and closes it when its trigger is clicked again', () => {
    const dropdown = document.querySelector('.dropdown')
    const toggle = document.querySelector('#first-toggle')
    const menu = dropdown.querySelector('.dropdown-menu')

    click(toggle)
    expect(dropdown.classList.contains('show')).toBe(true)
    expect(menu.classList.contains('show')).toBe(true)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    click(toggle)
    expect(dropdown.classList.contains('show')).toBe(false)
    expect(menu.classList.contains('show')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes any open dropdown before opening another', () => {
    const first = document.querySelector('#first-toggle')
    const second = document.querySelector('#second-toggle')

    click(first)
    click(second)

    expect(document.querySelector('#first-toggle').getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('#second-toggle').getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelectorAll('.dropdown.show')).toHaveLength(1)
  })

  it('closes a dropdown when an option is selected and prevents the placeholder link navigation', () => {
    const toggle = document.querySelector('#first-toggle')
    const option = document.querySelector('#first-option')

    click(toggle)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    const navigationAllowed = option.dispatchEvent(event)

    expect(navigationAllowed).toBe(false)
    expect(document.querySelector('.dropdown').classList.contains('show')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes an open dropdown after an outside click', () => {
    const toggle = document.querySelector('#first-toggle')

    click(toggle)
    click(document.querySelector('#outside'))

    expect(document.querySelector('.dropdown').classList.contains('show')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes an open dropdown on Escape and returns focus to its trigger', () => {
    const toggle = document.querySelector('#first-toggle')
    click(toggle)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(document.querySelector('.dropdown').classList.contains('show')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })

  it('does not open a collapse when its target cannot be found', () => {
    const toggle = document.querySelector('#nav-toggle')
    toggle.setAttribute('data-ui-target', '#missing')

    expect(() => click(toggle)).not.toThrow()
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })
})
