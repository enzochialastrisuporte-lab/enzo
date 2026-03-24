import { useState } from 'react';
import { 
  Webhook, 
  Settings, 
  Shuffle, 
  Database, 
  Clock, 
  Search, 
  Code2, 
  Bot, 
  Type, 
  Mic, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  UserPlus, 
  CreditCard,
  Layers,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';

interface NodeInfo {
  id: string;
  name: string;
  type: string;
  icon: any;
  description: string;
  color: string;
}

const nodes: NodeInfo[] = [
  {
    id: "1",
    name: "Mensagem recebida",
    type: "Webhook",
    icon: Webhook,
    color: "text-blue-400",
    description: "Este é o ponto de entrada principal de toda a automação, funcionando como um receptor de eventos em tempo real. Ele aguarda requisições POST vindas do Chatwoot sempre que um novo contato interage com o sistema. Sem este nó, a automação não saberia quando agir, pois ele captura os dados brutos da conversa. É o gatilho inicial que dispara toda a lógica subsequente do fluxo de atendimento."
  },
  {
    id: "2",
    name: "Info",
    type: "Set",
    icon: Settings,
    color: "text-purple-400",
    description: "Este nó é responsável por organizar e padronizar as informações recebidas do webhook para uso posterior. Ele extrai campos essenciais como o ID da mensagem, o telefone do contato, o nome e o conteúdo da mensagem. Ao centralizar esses dados, ele evita que outros nós precisem navegar em estruturas JSON complexas repetidamente. É uma etapa de saneamento de dados vital para a estabilidade e clareza do workflow."
  },
  {
    id: "3",
    name: "Reset ou teste",
    type: "Switch",
    icon: Shuffle,
    color: "text-orange-400",
    description: "Atua como um roteador inteligente que verifica se o usuário enviou comandos especiais de controle. Ele identifica se a mensagem é um pedido de '/reset' para limpar a memória ou '/teste' para habilitar modos específicos. Caso não seja um comando, ele direciona o fluxo para o processamento normal de mensagens. Essa lógica permite que administradores gerenciem o estado da conversa de forma simples e direta."
  },
  {
    id: "4",
    name: "Tipo de mensagem",
    type: "Switch",
    icon: Layers,
    color: "text-yellow-400",
    description: "Este componente analisa a natureza da mídia enviada pelo usuário para decidir o melhor caminho de processamento. Ele distingue entre mensagens de texto puro, arquivos anexados ou mensagens de áudio gravadas. Dependendo do tipo, o fluxo pode seguir para download de mídia, transcrição ou enfileiramento direto. É essencial para garantir que a automação saiba lidar com diferentes formatos de comunicação."
  },
  {
    id: "5",
    name: "Enfileirar mensagem",
    type: "Postgres",
    icon: Database,
    color: "text-emerald-400",
    description: "Este nó realiza a persistência temporária das mensagens em um banco de dados PostgreSQL para controle de fila. Ele registra o telefone, o conteúdo e o timestamp de cada interação recebida para evitar perdas de dados. Essa estratégia permite que o sistema gerencie múltiplas mensagens enviadas em sequência rápida pelo usuário. É a base para o sistema de 'anti-encavalamento' que garante a ordem correta das respostas."
  },
  {
    id: "6",
    name: "Esperar",
    type: "Wait",
    icon: Clock,
    color: "text-cyan-400",
    description: "Introduz um atraso estratégico de alguns segundos antes de prosseguir com o processamento da resposta. Esse tempo é fundamental para permitir que o usuário termine de enviar múltiplas mensagens curtas antes do agente responder. Sem essa pausa, a automação poderia responder a cada frase individualmente, o que seria confuso e ineficiente. Ele ajuda a agrupar o contexto completo da intenção do usuário em uma única rodada."
  },
  {
    id: "7",
    name: "Buscar mensagens",
    type: "Postgres",
    icon: Search,
    color: "text-emerald-400",
    description: "Consulta o banco de dados para recuperar todas as mensagens acumuladas na fila para um determinado contato. Ele busca o histórico recente que ainda não foi processado pelo agente de inteligência artificial. Com esses dados em mãos, o sistema pode entender o contexto total do que foi dito durante o período de espera. É o nó que consolida a entrada de dados antes da tomada de decisão da IA."
  },
  {
    id: "8",
    name: "Mensagem encavalada?",
    type: "Code",
    icon: Code2,
    color: "text-pink-400",
    description: "Executa um script JavaScript personalizado para verificar se a mensagem atual ainda é a mais recente na fila. Se uma nova mensagem chegou enquanto o fluxo estava esperando, este nó interrompe a execução atual para evitar respostas duplicadas. Isso garante que apenas a última instância do workflow (a que contém o contexto mais atualizado) continue. É uma proteção crítica contra loops e respostas desencontradas em chats simultâneos."
  },
  {
    id: "9",
    name: "Secretária v3",
    type: "AI Agent",
    icon: Bot,
    color: "text-indigo-400",
    description: "O 'cérebro' da automação, utilizando modelos de linguagem avançados para interpretar e responder aos usuários. Ela atua como a AutomaçaoOne, uma secretária virtual empática e profissional que segue regras de negócio estritas. Este agente tem acesso a diversas ferramentas para buscar agendas, criar compromissos e consultar arquivos. É onde a mágica da inteligência artificial acontece, transformando texto bruto em ações úteis."
  },
  {
    id: "10",
    name: "Formatar texto",
    type: "Chain LLM",
    icon: Type,
    color: "text-violet-400",
    description: "Refina a saída gerada pelo agente para garantir que ela esteja perfeitamente adequada ao formato do WhatsApp. Ele remove caracteres desnecessários, ajusta a pontuação e garante que links ou números de telefone estejam legíveis. Este nó foca exclusivamente na estética e na clareza da comunicação escrita final. É o toque final de polimento que separa uma resposta robótica de um atendimento profissional."
  },
  {
    id: "11",
    name: "Gerar áudio",
    type: "ElevenLabs",
    icon: Mic,
    color: "text-red-400",
    description: "Converte a resposta textual formatada em uma voz humana natural e expressiva usando tecnologia de ponta. Ele utiliza a API do ElevenLabs para criar uma experiência auditiva que soa como uma pessoa real falando. Este nó é ativado apenas se a preferência do usuário for receber respostas por áudio. Ele adiciona uma camada de acessibilidade e humanização que aumenta drasticamente o engajamento do cliente."
  },
  {
    id: "12",
    name: "Escalar humano",
    type: "Tool Workflow",
    icon: UserPlus,
    color: "text-rose-400",
    description: "Este nó é acionado quando a IA identifica que a solicitação do usuário está fora de seu escopo ou exige intervenção humana. Ele notifica os gestores responsáveis e transfere o controle da conversa para que um atendente real possa prosseguir. É uma válvula de segurança essencial para garantir que casos complexos ou sensíveis não fiquem sem a devida atenção. Garante que a automação saiba seus limites e quando pedir ajuda."
  },
  {
    id: "13",
    name: "Buscar janelas",
    type: "Tool Workflow",
    icon: Calendar,
    color: "text-sky-400",
    description: "Interage diretamente com o Google Calendar para encontrar horários disponíveis que coincidam com as preferências do cliente. Ele analisa a agenda do profissional selecionado e retorna opções viáveis de agendamento em tempo real. Sem este nó, o processo de marcação de consultas seria manual e sujeito a erros de conflito de horário. É uma ferramenta de produtividade que automatiza uma das tarefas mais repetitivas de uma secretária."
  },
  {
    id: "14",
    name: "Criar cobrança",
    type: "Tool Workflow",
    icon: CreditCard,
    color: "text-lime-400",
    description: "Responsável pela integração financeira, este nó gera cobranças automáticas via Asaas após a confirmação de um agendamento. Ele cria o registro do cliente, gera o link de pagamento ou PIX e vincula a transação ao atendimento atual. Isso fecha o ciclo de serviço, garantindo que o aspecto financeiro seja tratado de forma profissional e imediata. Automatiza o faturamento e reduz a inadimplência através de lembretes integrados."
  }
];

export default function App() {
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 selection:bg-blue-500/30">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Cpu className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-blue-400/80">Workflow Documentation</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-light tracking-tighter mb-6"
        >
          Biografia da <span className="italic font-serif">Automação</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-gray-400 text-lg leading-relaxed"
        >
          Uma análise técnica detalhada dos componentes que compõem a AutomaçaoOne, 
          a secretária virtual inteligente projetada para revolucionar o atendimento via WhatsApp.
        </motion.p>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2, ease: "easeOut" } 
              }}
              onClick={() => setSelectedNode(node)}
              className="group cursor-pointer"
            >
              <div className="h-full p-8 rounded-2xl bg-[#111111] border border-white/5 group-hover:border-blue-500/30 group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] transition-all duration-300 flex flex-col glass-card">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl bg-white/5 ${node.color} group-hover:scale-110 transition-transform duration-300`}>
                    <node.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 py-1 px-2 bg-white/5 rounded-md">
                    {node.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium mb-4 group-hover:text-blue-400 transition-colors">
                  {node.name}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 flex-grow">
                  {node.description}
                </p>
                
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center text-[10px] font-mono uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                  <span>Ver Detalhes</span>
                  <ArrowRightLeft className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Advantages and Disadvantages Section */}
      <section className="max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01, y: -4 }}
            className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 glass-card"
          >
            <h2 className="text-2xl font-medium text-emerald-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Vantagens
            </h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">•</span>
                <p><strong className="text-white">Atendimento 24/7:</strong> Sua empresa nunca para. Respostas imediatas em qualquer horário, inclusive domingos e feriados.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">•</span>
                <p><strong className="text-white">Redução de Custos:</strong> Automatiza tarefas repetitivas que exigiriam múltiplos funcionários, reduzindo drasticamente a folha de pagamento.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">•</span>
                <p><strong className="text-white">Padronização:</strong> Garante que todos os clientes recebam o mesmo nível de excelência e informações precisas, sem erros humanos.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">•</span>
                <p><strong className="text-white">Integração Total:</strong> Conecta-se nativamente com Google Calendar, Drive e sistemas de pagamento como Asaas.</p>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01, y: -4 }}
            className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-all duration-300 glass-card"
          >
            <h2 className="text-2xl font-medium text-rose-400 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Desvantagens
            </h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">•</span>
                <p><strong className="text-white">Dependência de APIs:</strong> O funcionamento depende da estabilidade de serviços externos (OpenAI, Google, Chatwoot).</p>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">•</span>
                <p><strong className="text-white">Casos Complexos:</strong> Assuntos muito específicos ou sensíveis ainda podem exigir a intervenção de um humano.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">•</span>
                <p><strong className="text-white">Custo de Tokens:</strong> O uso intensivo de IA gera custos variáveis baseados no volume de mensagens processadas.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-rose-500 font-bold">•</span>
                <p><strong className="text-white">Configuração Inicial:</strong> Requer um setup técnico cuidadoso para garantir que todas as ferramentas funcionem em harmonia.</p>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 text-xs font-mono uppercase tracking-widest">
        <p>© 2026 Chialastri Automações • AutomaçaoOne</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Documentação</a>
          <a href="#" className="hover:text-white transition-colors">Suporte</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </div>
      </footer>

      {/* Modal / Detail View */}
      {selectedNode && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedNode(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full bg-[#111111] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-2xl bg-white/5 ${selectedNode.color}`}>
                <selectedNode.icon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1 block">
                  {selectedNode.type}
                </span>
                <h2 className="text-3xl font-medium">{selectedNode.name}</h2>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                {selectedNode.description}
              </p>
            </div>
            
            <button 
              onClick={() => setSelectedNode(null)}
              className="mt-10 w-full py-4 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
            >
              Fechar Detalhes
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
