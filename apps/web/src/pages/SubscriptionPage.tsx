import { useParams, Link } from "react-router-dom";

export default function SubscriptionPage() {
  const { slug } = useParams();
  
  // ⚠️ COLOCA AQUI OS TEUS DADOS REAIS
  const MEU_WHATSAPP = "244923000000"; 
  const MEU_IBAN = "AO06 0000 0000 0000 0000 0000 0";
  const MEU_EXPRESS = "923 000 000";
  const PRECO = "15.000 Kz";

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-zinc-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Ativar Subscrição</h1>
          <p className="text-sm text-zinc-500">Escolha o seu plano para continuar a usar o sistema do seu negócio.</p>
        </div>
        
        <div className="border-2 border-zinc-900 rounded-xl p-4 flex justify-between items-center mb-8 bg-zinc-50">
          <div>
            <p className="font-bold text-zinc-900">Plano Profissional</p>
            <p className="text-xs text-zinc-500">Acesso total à Loja e Reservas</p>
          </div>
          <span className="font-extrabold text-xl text-zinc-900">{PRECO}</span>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-900 mb-6 border border-blue-100">
          <p className="font-bold mb-2">Dados para Pagamento:</p>
          <p><strong>IBAN:</strong> {MEU_IBAN}</p>
          <p><strong>Express:</strong> {MEU_EXPRESS}</p>
          <p className="mt-4 text-xs opacity-80">Após efetuar o pagamento, envie o comprovativo no WhatsApp para ativarmos a sua conta em menos de 5 minutos.</p>
        </div>

        <a 
          href={`https://wa.me/${MEU_WHATSAPP}?text=Olá, acabei de pagar a subscrição do sistema para o negócio ${slug}. Aqui está o comprovativo.`}
          target="_blank"
          rel="noreferrer"
          className="w-full flex justify-center items-center gap-2 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors mb-4 shadow-md"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Enviar Comprovativo
        </a>

        <Link to={`/${slug}/admin`} className="block text-center text-sm text-zinc-500 hover:text-zinc-900 font-medium">
          Voltar ao Painel
        </Link>
      </div>
    </div>
  );
}