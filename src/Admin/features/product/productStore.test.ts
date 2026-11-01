import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProductStore } from './productStore';
import { productApi } from './productApi';

describe('productStore (Zustand)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useProductStore.getState().clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia con estado inicial vacío', () => {
    const state = useProductStore.getState();
    expect(state.products).toEqual([]);
    expect(state.selectedProduct).toBeNull();
    expect(state.selectedVariant).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchProducts obtiene lista de productos y actualiza el store', async () => {
    const mockProducts = [
      {
        id: 'p-1',
        title: 'Producto 1',
        picture: '/p1.jpg',
        logo: '/logo1.jpg',
        info_header: 'Header 1',
        info_body: 'Body 1',
        isAlive: true,
        url: 'http://test.com',
        enabled: true,
      },
    ];

    vi.spyOn(productApi, 'getAll').mockResolvedValue(mockProducts);

    const result = await useProductStore.getState().fetchProducts();

    expect(result).toEqual(mockProducts);
    expect(useProductStore.getState().products).toEqual(mockProducts);
    expect(useProductStore.getState().isLoading).toBe(false);
  });

  it('fetchProductById obtiene detalle y sus variantes', async () => {
    const mockProduct = {
      id: 'p-1',
      title: 'Producto Completo',
      picture: '/full.jpg',
      logo: '/logo.jpg',
      info_header: 'Header',
      info_body: 'Body',
      isAlive: true,
      url: 'http://test.com',
      enabled: true,
      variants: [
        {
          id: 'v-1',
          productId: 'p-1',
          picture: '/var1.jpg',
          text: 'Variante 1',
          enabled: true,
        },
      ],
    };

    vi.spyOn(productApi, 'getById').mockResolvedValue(mockProduct);

    const result = await useProductStore.getState().fetchProductById('p-1');

    expect(result).toEqual(mockProduct);
    expect(useProductStore.getState().selectedProduct).toEqual(mockProduct);
    expect(useProductStore.getState().isLoading).toBe(false);
  });

  it('fetchVariantById obtiene detalle de la variante', async () => {
    const mockVariant = {
      id: 'v-1',
      productId: 'p-1',
      picture: '/v1.jpg',
      text: 'Texto variante',
      enabled: true,
    };

    vi.spyOn(productApi, 'getVariantById').mockResolvedValue(mockVariant);

    const result = await useProductStore.getState().fetchVariantById('v-1');

    expect(result).toEqual(mockVariant);
    expect(useProductStore.getState().selectedVariant).toEqual(mockVariant);
  });

  it('deleteProduct elimina producto del listado', async () => {
    useProductStore.setState({
      products: [
        {
          id: 'p-1',
          title: 'P1',
          picture: '',
          logo: '',
          info_header: '',
          info_body: null,
          isAlive: false,
          url: '',
          enabled: true,
        },
        {
          id: 'p-2',
          title: 'P2',
          picture: '',
          logo: '',
          info_header: '',
          info_body: null,
          isAlive: false,
          url: '',
          enabled: true,
        },
      ],
    });

    vi.spyOn(productApi, 'deleteProduct').mockResolvedValue(undefined);

    const success = await useProductStore.getState().deleteProduct('p-1');

    expect(success).toBe(true);
    expect(useProductStore.getState().products.length).toBe(1);
    expect(useProductStore.getState().products[0].id).toBe('p-2');
  });

  it('deleteVariant elimina variante de selectedProduct', async () => {
    useProductStore.setState({
      selectedProduct: {
        id: 'p-1',
        title: 'P1',
        picture: '',
        logo: '',
        info_header: '',
        info_body: null,
        isAlive: false,
        url: '',
        enabled: true,
        variants: [
          { id: 'v-1', productId: 'p-1', picture: '', text: 'V1', enabled: true },
          { id: 'v-2', productId: 'p-1', picture: '', text: 'V2', enabled: true },
        ],
      },
    });

    vi.spyOn(productApi, 'deleteVariant').mockResolvedValue(undefined);

    const success = await useProductStore.getState().deleteVariant('v-1', 'p-1');

    expect(success).toBe(true);
    expect(useProductStore.getState().selectedProduct?.variants?.length).toBe(1);
    expect(useProductStore.getState().selectedProduct?.variants?.[0].id).toBe('v-2');
  });

  it('createProduct añade el nuevo producto a la lista', async () => {
    const mockCreated = {
      id: 'p-new',
      title: 'Nuevo Producto',
      picture: '/new.jpg',
      logo: '/new.jpg',
      info_header: 'Header New',
      info_body: 'Body New',
      isAlive: true,
      url: 'https://new.com',
      enabled: true,
      variants: [],
    };

    vi.spyOn(productApi, 'create').mockResolvedValue(mockCreated);

    const result = await useProductStore.getState().createProduct({
      title: 'Nuevo Producto',
      picture: '/new.jpg',
      logo: '/new.jpg',
      info_header: 'Header New',
      info_body: 'Body New',
      isAlive: true,
      url: 'https://new.com',
    });

    expect(result).toEqual(mockCreated);
    expect(useProductStore.getState().products[0]).toEqual(mockCreated);
  });

  it('updateProduct actualiza el producto en products y en selectedProduct', async () => {
    const initialProduct = {
      id: 'p-1',
      title: 'Producto Viejo',
      picture: '/old.jpg',
      logo: '/old.jpg',
      info_header: 'Header',
      info_body: 'Body',
      isAlive: false,
      url: '',
      enabled: false,
      variants: [],
    };
    const updatedProduct = {
      ...initialProduct,
      title: 'Producto Editado',
      isAlive: true,
      url: 'https://actualizado.com',
      enabled: true,
    };

    useProductStore.setState({
      products: [initialProduct],
      selectedProduct: initialProduct,
    });

    vi.spyOn(productApi, 'update').mockResolvedValue(updatedProduct);

    const result = await useProductStore.getState().updateProduct('p-1', {
      title: 'Producto Editado',
      isAlive: true,
      url: 'https://actualizado.com',
      enabled: true,
    });

    expect(result).toEqual(updatedProduct);
    expect(useProductStore.getState().selectedProduct?.title).toBe('Producto Editado');
    expect(useProductStore.getState().products[0].title).toBe('Producto Editado');
  });

  it('updateVariant actualiza la variante en selectedVariant y en selectedProduct.variants', async () => {
    const initialVariant = {
      id: 'v-1',
      productId: 'p-1',
      picture: '/v1.jpg',
      text: 'Texto Viejo',
      enabled: false,
    };
    const updatedVariant = {
      ...initialVariant,
      text: 'Texto Actualizado',
      enabled: true,
    };

    useProductStore.setState({
      selectedVariant: initialVariant,
      selectedProduct: {
        id: 'p-1',
        title: 'Producto 1',
        picture: '/p.jpg',
        logo: '/logo.jpg',
        info_header: 'Header',
        info_body: null,
        isAlive: false,
        url: '',
        enabled: true,
        variants: [initialVariant],
      },
    });

    vi.spyOn(productApi, 'updateVariant').mockResolvedValue(updatedVariant);

    const result = await useProductStore.getState().updateVariant('v-1', 'p-1', {
      text: 'Texto Actualizado',
      enabled: true,
    });

    expect(result).toEqual(updatedVariant);
    expect(useProductStore.getState().selectedVariant?.text).toBe('Texto Actualizado');
    expect(useProductStore.getState().selectedProduct?.variants?.[0].text).toBe('Texto Actualizado');
  });
});
