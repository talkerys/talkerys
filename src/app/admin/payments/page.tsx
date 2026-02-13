import { prisma } from "@/server/db";
import PaymentActions from "./payment-actions";

export default async function AdminPayments() {
  const payments = await prisma.payment.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main>
      <h1>Pagos</h1>
      <p>Aprueba un pago para cargar créditos al usuario.</p>
      <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>
        {payments.map(p => (
          <li key={p.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <b>{p.user.fullName}</b> — {p.user.email}<br/>
            Plan: <b>{p.plan}</b> — Monto: <b>S/{p.amount}</b> — Método: <b>{p.method}</b> — Estado: <b>{p.status}</b><br/>
            {p.receiptUrl ? <a href={p.receiptUrl} target="_blank">Ver comprobante</a> : <span>Sin comprobante</span>}
            <PaymentActions paymentId={p.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
