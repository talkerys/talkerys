import BillingForm from "./billing-form";

export default function BillingPage() {
  return (
    <main>
      <h1>Pagar (Yape / Plin)</h1>
      <p>Sube tu comprobante. El estado quedará en “Pendiente” hasta validación.</p>
      <BillingForm />
      <hr />
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        Tip: en producción, coloca tus QR reales en esta página (public/qr-yape.png, public/qr-plin.png).
      </p>
    </main>
  );
}
