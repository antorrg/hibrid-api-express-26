import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AnyAction } from '@reduxjs/toolkit';
import { productsApi } from '../../AdminApi/productsApi';
import type { IProduct, IItem } from '../../../types/product';

// Estado del slice
interface ProductState {
  
    // Productos admin (con items)
    products: IProduct[];
    items: IItem[];
    selectedProduct: IProduct | null;
    selectedItem: IItem | null;
    adminLoading: boolean;

    // Estados compartidos
    error: string | null;
}

// Estado inicial
const initialState: ProductState = {

    products: [],
    items: [],
    selectedProduct: null,
    selectedItem: null,
    adminLoading: false,
    error: null
};


// Thunks autenticados (admin)
export const getAllProducts = createAsyncThunk(
    'product/getAllProducts',
    async (_, { rejectWithValue }) => {
        try {
            return await productsApi.getAll();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Error al cargar productos');
        }
    }
);

export const getProductById = createAsyncThunk(
    'product/getProductById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await productsApi.getById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Error al cargar producto');
        }
    }
);

export const getItem = createAsyncThunk(
    'product/getItem',
    async (id: number, { rejectWithValue }) => {
        try {
            return  await productsApi.getItem(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Error al cargar producto');
        }
    }
);

const adminProductSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        selectProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        selectItem: (state, action) => {
            state.selectedItem = action.payload;
        },
        clearSelectedItem: (state) => {
            state.selectedItem = null;
        }
    },
    extraReducers: (builder) => {
        // Specific fulfilled cases (Data Updates)
        builder
            // Admin Products
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.selectedProduct = action.payload;
            })
            .addCase(getItem.fulfilled, (state, action) => {
                state.selectedItem = action.payload;
            })

            // Matchers for Loading/Error/Fulfilled state management
            .addMatcher(
                (action) => action.type.startsWith('product/') && action.type.endsWith('/pending'),
                (state) => {
                    state.error = null;
                    state.adminLoading = true;
                    
                }
            )
            .addMatcher(
                (action): action is AnyAction => action.type.startsWith('product/') && action.type.endsWith('/rejected'),
                (state, action: AnyAction) => {
                        state.adminLoading = false;
                    if (action.payload) {
                        state.error = action.payload as string;
                    } else {
                        state.error = action.error?.message || 'Error desconocido';
                    }
                }
            )
            .addMatcher(
                (action): action is AnyAction => action.type.startsWith('product/') && action.type.endsWith('/fulfilled'),
                (state) => {
                        state.adminLoading = false;
                }
            );
    }
});

export const { clearError, selectProduct, clearSelectedProduct, selectItem, clearSelectedItem } = adminProductSlice.actions;
export default adminProductSlice.reducer;
