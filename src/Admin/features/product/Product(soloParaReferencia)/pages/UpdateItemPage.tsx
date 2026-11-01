import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemUpdateForm } from "../components/ItemUpdateForm";
import { type ItemUpdateFormData } from "../validations/productSchema";
import { productsApi } from "../../../AdminApi/productsApi";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getItem, clearSelectedItem } from "../productAdminSlice";
import Loader2 from "../../../../components/Loader2";

const UpdateItemPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [load, setLoad] = useState(false);

  const selectedItem = useAppSelector(state => state.adminProduct.selectedItem);
  const adminLoading = useAppSelector(state => state.adminProduct.adminLoading);
  const error = useAppSelector(state => state.adminProduct.error);

  useEffect(() => {
    if (id) {
      dispatch(getItem(Number(id)));
    }
    return () => {
      dispatch(clearSelectedItem());
    }
  }, [id, dispatch]);

  const onClose = () => {
    setLoad(false);
  };

  const cancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (data: ItemUpdateFormData) => {
    if (!id) return;

    const confirmed = await productsApi.confirmAction({
      title: '¿Está seguro de actualizar este item?'
    });

    if (confirmed) {
      setLoad(true);

      const payload = {
        id: Number(id),
        text: data.text,
        picture: data.picture ?? null,
        useImg: data.useImg,
        saver: data.saver ?? false,
        enabled: data.enabled ?? false,
      };

      try {
        const result = await productsApi.updateItem(payload.id, payload);

        if (result) {
         // alert("Item actualizado con éxito"); // Fallback alert
          navigate(-1);
        } else {
         // alert("Error al actualizar item");
          onClose();
        }
      } catch (error) {
        //alert("Error al procesar la solicitud");
        console.error(error);
        onClose();
      }
    }
  };

  if (!id) {
    return <div>Error: Item ID is missing</div>;
  }


  if (error) {
    return <div className="alert alert-danger m-4">Error: {error}</div>;
  }

  return (
    <div className="imageBack">
      <div className="coverBack" >
        <div className="container-md modal-content colorBack formProductContainer rounded-4 shadow p-4">
          <h2 className="title-form m-0">Actualizar Item</h2>
          {adminLoading?
          <Loader2
           fullScreen={false}
           scale={0.5}
           />
           :
           <>
        {selectedItem && (
          <ItemUpdateForm
          defaultValues={{
            text: selectedItem.text ?? "",
            picture: selectedItem.picture ?? "",
            useImg: false, // IItem from type doesn't contain useImg natively so we provide a safe fallback locally for the form
            saver: true, // Default true on edit
            enabled: selectedItem.enabled ?? false
          }}
          onSubmit={handleSubmit}
          onCancel={cancel}
          load={load}
          />
        )}
          </>
        }
      </div>
    </div>
    </div>
  );
};

export default UpdateItemPage;