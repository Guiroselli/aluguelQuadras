import React from 'react';
import { Shield, Clock, HandMetal, AlertCircle, CheckCircle } from 'lucide-react';

const RegulationsView: React.FC = () => {
  return (
    <div className="regulations-container animate-fade-in max-w-4xl mx-auto">
      <div className="glass-panel p-10 mb-12">
        <h1 className="mb-6">Regulamento de Uso das Quadras</h1>
        <p className="text-muted mb-10" style={{ fontSize: '1.125rem' }}>
          Para garantir a boa convivência e o estado de conservação do nosso Clube Ecoville II, 
          pedimos que todos os moradores sigam atentamente as regras abaixo.
        </p>

        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <Clock size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Horários e Duração</h3>
              <p>O uso das quadras é permitido das <strong>06:00 às 23:00</strong>.</p>
              <p>Cada reserva tem a duração máxima de <strong>1 hora</strong> por dia por morador.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Reserva Antecipada</h3>
              <p>As reservas podem ser feitas com até <strong>7 dias</strong> de antecedência.</p>
              <p>Em caso de cancelamento, pedimos que seja feito com no mínimo 2 horas de antecedência.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <Shield size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Vestimenta Adequada</h3>
              <p>É obrigatório o uso de calçados apropriados para cada tipo de quadra.</p>
              <p>Para a quadra rápida de tênis, utilize tênis de solado específico.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <HandMetal size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Conduta e Limpeza</h3>
              <p>Zele pela limpeza do local. Coloque o lixo nas lixeiras apropriadas.</p>
              <p>Evite gritos ou ruídos excessivos que possam incomodar os moradores vizinhos.</p>
            </div>
          </div>
        </div>

        <div className="important-alert mt-10 p-6 bg-surface-dark rounded border-l-4 border-warning">
          <div className="flex gap-4">
            <AlertCircle className="text-warning flex-shrink-0" size={24} />
            <div>
              <h4 className="mb-2">Atenção ao Clima</h4>
              <p className="text-muted text-sm">
                Em dias de chuva, o uso da quadra de tênis (rápida) é suspenso por motivos de segurança (risco de escorregamento). 
                Pedimos a compreensão de todos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rules-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }
        
        @media (max-width: 768px) {
          .rules-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        
        .rule-card {
          display: flex;
          gap: 1.5rem;
        }
        
        .rule-icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(194, 253, 74, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .rule-content h3 {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }
        
        .rule-content p {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }
        
        .important-alert {
          background: rgba(255, 171, 0, 0.05);
          border-left-color: #ffab00;
        }
        
        .text-warning { color: #ffab00; }
        .border-warning { border-color: #ffab00; }
      `}} />
    </div>
  );
};

export default RegulationsView;
