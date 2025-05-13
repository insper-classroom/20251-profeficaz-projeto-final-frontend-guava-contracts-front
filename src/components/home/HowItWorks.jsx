function HowItWorksSection() {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="how-it-works-title">Como Funciona</h2>
        <div className="how-it-works-grid">
          <div className="how-it-works-item">
            <div className="how-it-works-icon">📄</div>
            <h3>Crie seu Contrato</h3>
            <p>Defina os termos, prazos e pagamentos do seu projeto em um contrato inteligente.</p>
          </div>
          <div className="how-it-works-item">
            <div className="how-it-works-icon">🤝</div>
            <h3>Conecte-se</h3>
            <p>Encontre freelancers ou clientes e feche acordos com segurança.</p>
          </div>
          <div className="how-it-works-item">
            <div className="how-it-works-icon">✅</div>
            <h3>Execute e Pague</h3>
            <p>O contrato inteligente garante que os pagamentos sejam liberados automaticamente após a conclusão do trabalho.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;