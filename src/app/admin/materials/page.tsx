import UploadMaterialForm from "./upload-form";

export default function AdminMaterials() {
  return (
    <main>
      <h1>Materiales</h1>
      <UploadMaterialForm />
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        MVP: sube PDF/archivos y define el alcance (General / Usuario). Luego puedes extender a Evento y Mesa.
      </p>
    </main>
  );
}
