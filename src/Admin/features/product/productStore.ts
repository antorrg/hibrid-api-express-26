import { create } from 'zustand';
import { productApi } from './productApi';
import { toast } from '../../../shared/toast/toastManager';
import type {
  IProduct,
  IProductSummary,
  IVariantProduct,
  CreateProductDTO,
  UpdateProductDTO,
  UpdateVariantDTO,
} from './productTypes';

interface ProductState {
  products: IProductSummary[];
  selectedProduct: IProduct | null;
  selectedVariant: IVariantProduct | null;
  isLoading: boolean;
  error: string | null;

  fetchProducts: () => Promise<IProductSummary[]>;
  fetchProductById: (id: string) => Promise<IProduct | null>;
  createProduct: (data: CreateProductDTO) => Promise<IProduct | null>;
  updateProduct: (id: string, data: UpdateProductDTO) => Promise<IProduct | null>;
  fetchVariantById: (id: string) => Promise<IVariantProduct | null>;
  updateVariant: (id: string, productId: string, data: UpdateVariantDTO) => Promise<IVariantProduct | null>;
  deleteProduct: (id: string, saver?: boolean) => Promise<boolean>;
  deleteVariant: (id: string, productId: string, saver?: boolean) => Promise<boolean>;
  clearSelectedProduct: () => void;
  clearSelectedVariant: () => void;
  clearAll: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  selectedVariant: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await productApi.getAll();
      set({ products: data || [], isLoading: false });
      return data || [];
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener productos';
      set({ error: message, isLoading: false });
      toast.error(message);
      return [];
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await productApi.getById(id);
      set({ selectedProduct: data || null, isLoading: false });
      return data || null;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener detalle del producto';
      set({ error: message, isLoading: false, selectedProduct: null });
      toast.error(message);
      return null;
    }
  },

  createProduct: async (data: CreateProductDTO) => {
    set({ isLoading: true, error: null });
    try {
      const created = await productApi.create(data);
      set((state) => ({
        products: [created, ...state.products],
        isLoading: false,
      }));
      toast.success('Producto creado exitosamente');
      return created;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al crear producto';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateProduct: async (id: string, data: UpdateProductDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await productApi.update(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        selectedProduct:
          state.selectedProduct?.id === id
            ? { ...state.selectedProduct, ...updated }
            : state.selectedProduct,
        isLoading: false,
      }));
      toast.success('Producto actualizado exitosamente');
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar producto';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  fetchVariantById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await productApi.getVariantById(id);
      set({ selectedVariant: data || null, isLoading: false });
      return data || null;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener detalle de la variante';
      set({ error: message, isLoading: false, selectedVariant: null });
      toast.error(message);
      return null;
    }
  },

  updateVariant: async (id: string, productId: string, data: UpdateVariantDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await productApi.updateVariant(id, data);
      set((state) => {
        const currentProduct = state.selectedProduct;
        return {
          selectedVariant: state.selectedVariant?.id === id ? updated : state.selectedVariant,
          selectedProduct:
            currentProduct && currentProduct.id === productId
              ? {
                  ...currentProduct,
                  variants: currentProduct.variants?.map((v) => (v.id === id ? updated : v)) || [],
                }
              : currentProduct,
          isLoading: false,
        };
      });
      toast.success('Variante actualizada exitosamente');
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar variante';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  deleteProduct: async (id: string, saver = false) => {
    set({ isLoading: true, error: null });
    try {
      await productApi.deleteProduct(id, saver);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }));
      toast.success('Producto eliminado exitosamente');
      return true;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al eliminar producto';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  deleteVariant: async (id: string, productId: string, saver = false) => {
    set({ isLoading: true, error: null });
    try {
      await productApi.deleteVariant(id, saver);
      // Actualizamos variantes dentro del producto seleccionado
      const currentSelected = get().selectedProduct;
      if (currentSelected && currentSelected.id === productId) {
        set({
          selectedProduct: {
            ...currentSelected,
            variants: currentSelected.variants?.filter((v) => v.id !== id) || [],
          },
          selectedVariant: get().selectedVariant?.id === id ? null : get().selectedVariant,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
      toast.success('Variante eliminada exitosamente');
      return true;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al eliminar variante';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  clearSelectedProduct: () => set({ selectedProduct: null }),
  clearSelectedVariant: () => set({ selectedVariant: null }),
  clearAll: () => set({ products: [], selectedProduct: null, selectedVariant: null, error: null, isLoading: false }),
}));
