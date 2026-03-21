import React from 'react';
import { AlertCircle, CheckCircle, Clock, HandMetal, Shield } from 'lucide-react';

const RegulationsView: React.FC = () => {
  return (
    <div className="regulations-container animate-fade-in max-w-4xl mx-auto">
      <div className="glass-panel p-10 mb-12">
        <h1 className="mb-6">Regulamento de Uso das Quadras</h1>
        <p className="text-muted mb-10" style={{ fontSize: '1.125rem' }}>
          As regras abaixo agora sao validadas no Supabase antes da reserva ser concluida. Assim o
          sistema fica alinhado com o regulamento do condominio e nao depende apenas do navegador.
        </p>

        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <Clock size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Horarios e Duracao</h3>
              <p>O uso das quadras e permitido das <strong>06:00 as 23:00</strong>.</p>
              <p>Cada reserva ocupa <strong>1 hora</strong> e o ultimo inicio disponivel e as 22:00.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Reserva Antecipada</h3>
              <p>As reservas podem ser feitas com ate <strong>7 dias</strong> de antecedencia.</p>
              <p>Para a mesma unidade, so e permitida <strong>1 reserva antecipada por dia</strong>.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <Shield size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Mesmo Dia</h3>
              <p>Se a unidade ja possui uma reserva para hoje, uma nova so pode ser feita com no maximo <strong>1 hora</strong> de antecedencia.</p>
              <p>Horarios que ja comecaram ou ja passaram ficam indisponiveis automaticamente.</p>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-icon-wrapper">
              <HandMetal size={24} className="text-primary" />
            </div>
            <div className="rule-content">
              <h3>Cancelamento</h3>
              <p>O cancelamento precisa acontecer com pelo menos <strong>2 horas</strong> de antecedencia.</p>
              <p>Reservas dentro dessa janela ficam bloqueadas para evitar liberacao tardia do horario.</p>
            </div>
          </div>
        </div>

        <div className="important-alert mt-10 p-6 bg-surface-dark rounded border-l-4 border-warning">
          <div className="flex gap-4">
            <AlertCircle className="text-warning flex-shrink-0" size={24} />
            <div>
              <h4 className="mb-2">Autenticacao Obrigatoria</h4>
              <p className="text-muted text-sm">
                Agora cada reserva fica vinculada ao usuario autenticado no Supabase Auth. Isso
                impede cancelamentos por terceiros e reduz fraudes no processo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
              background: rgba(169, 29, 34, 0.1);
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

            .text-warning {
              color: #ffab00;
            }

            .border-warning {
              border-color: #ffab00;
            }
          `,
        }}
      />
    </div>
  );
};

export default RegulationsView;
