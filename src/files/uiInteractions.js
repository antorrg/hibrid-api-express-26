const collapseToggleSelector = '[data-ui-toggle="collapse"]'
const dropdownToggleSelector = '[data-ui-toggle="dropdown"]'
const productImageSelector = '.product-card-image'
let zoomTrigger = null

const openImageZoom = (image) => {
  const overlay = document.getElementById('imageZoom')
  const zoomedImage = document.getElementById('zoomedImage')
  const closeButton = overlay?.querySelector('[data-image-zoom-close]')

  if (!overlay || !zoomedImage || !closeButton) return

  zoomTrigger = image
  zoomedImage.src = image.currentSrc || image.src
  zoomedImage.alt = image.alt
  overlay.hidden = false
  document.body.classList.add('image-zoom-open')
  closeButton.focus()
}

const closeImageZoom = () => {
  const overlay = document.getElementById('imageZoom')
  const zoomedImage = document.getElementById('zoomedImage')

  if (!overlay || overlay.hidden) return

  overlay.hidden = true
  document.body.classList.remove('image-zoom-open')
  if (zoomedImage) zoomedImage.removeAttribute('src')
  zoomTrigger?.focus()
  zoomTrigger = null
}

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

  const productImage = event.target.closest(productImageSelector)
  if (productImage) {
    openImageZoom(productImage)
    return
  }

  const imageZoom = document.getElementById('imageZoom')
  if (
    imageZoom &&
    !imageZoom.hidden &&
    (event.target === imageZoom || event.target.closest('[data-image-zoom-close]'))
  ) {
    closeImageZoom()
    return
  }

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
  if (event.target instanceof Element && event.target.matches(productImageSelector) &&
      (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    openImageZoom(event.target)
    return
  }

  if (event.key !== 'Escape') return

  const imageZoom = document.getElementById('imageZoom')
  if (imageZoom && !imageZoom.hidden) {
    closeImageZoom()
    return
  }

  const openDropdown = document.querySelector('.dropdown.show')
  if (!openDropdown) return

  const toggle = openDropdown.querySelector(dropdownToggleSelector)
  closeDropdown(openDropdown)
  toggle?.focus()
})
