import type { RouteObject } from 'react-router-dom'


export const productRoutes: RouteObject[] = [
    {
        path: 'detalles/:id',
        lazy: async()=>{
            const {default: Product} = await import('./pages/Product')
            return {element: <Product/>}
        }
      
    },
    {
        path: 'creacion',
        lazy: async()=>{
            const {default: CreateProductPage } = await import('./pages/CreateProductPage')
            return {element: <CreateProductPage />}
        }
    },
    {
        path: 'edicion/:id',
                lazy: async()=>{
            const {default: UpdateProductPage } = await import('./pages/UpdateProductPage')
            return {element: <UpdateProductPage />}
        }
   
    },
    {
        path: 'detalles/item/:id',
        lazy: async ()=>{
            const {default: Item } = await import('./pages/Item')
            return { element: <Item />}
        }
    },
    {
        path: 'creacion/item/:productId',
        lazy: async ()=>{
            const {default: CreateItemPage} = await import('./pages/CreateItemPage')
            return { element: <CreateItemPage />}
        }
       
    },
    {
        path: 'edicion/item/:id',
        lazy: async ()=>{
            const {default: UpdateItemPage } = await import('./pages/UpdateItemPage')
            return { element: <UpdateItemPage />}
        }
    }
]