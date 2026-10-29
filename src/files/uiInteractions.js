const collapseToggleSelector = '[data-ui-toggle="collapse"]'
const dropdownToggleSelector = '[data-ui-toggle="dropdown"]'

const getTarget = (toggle) => {
  const selector = toggle.getAttribute('data-ui-target')
  return selector ? document.querySelector(selector) : null
}

const closeDropdown = (dropdown) => {
  const toggle = dropdown.querySelector(dropdownToggleSelector)
  const menu = dropdown.querySelector('.dropdown-menu')

  dropdown.classList.remove('show')
  menu?.classList.remove('show')
  toggle?.setAttribute('aria-expanded', 'false')
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return

  const collapseToggle = event.target.closest(collapseToggleSelector)
  if (collapseToggle) {
    const target = getTarget(collapseToggle)
    if (!target) return

    const isExpanded = target.classList.toggle('show')
    collapseToggle.setAttribute('aria-expanded', String(isExpanded))
    return
  }

  const dropdownToggle = event.target.closest(dropdownToggleSelector)
  if (dropdownToggle) {
    const dropdown = dropdownToggle.closest('.dropdown')
    const menu = dropdown?.querySelector('.dropdown-menu')
    if (!dropdown || !menu) return

    const shouldOpen = !menu.classList.contains('show')
    document.querySelectorAll('.dropdown.show').forEach(closeDropdown)

    if (shouldOpen) {
      dropdown.classList.add('show')
      menu.classList.add('show')
      dropdownToggle.setAttribute('aria-expanded', 'true')
    }
    return
  }

  const menu = event.target.closest('.dropdown-menu')
  if (menu) {
    if (event.target.closest('a[href="#"]')) event.preventDefault()
    const dropdown = menu.closest('.dropdown')
    if (dropdown) closeDropdown(dropdown)
    return
  }

  document.querySelectorAll('.dropdown.show').forEach(closeDropdown)
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return

  const openDropdown = document.querySelector('.dropdown.show')
  if (!openDropdown) return

  const toggle = openDropdown.querySelector(dropdownToggleSelector)
  closeDropdown(openDropdown)
  toggle?.focus()
})
