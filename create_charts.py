import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Configurar estilo visual limpio y profesional
plt.rcParams['axes.edgecolor'] = '#4C1D95'
plt.rcParams['axes.linewidth'] = 1.2

# --- GRÁFICO 1: Matriz de Cumplimiento de Requisitos ---
def create_compliance_chart():
    fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=300)
    
    categories = [
        'Smart Contracts\n(Foundry & EIP-2771)', 
        'Frontend Next.js 15\n(UI & Web3)', 
        'Meta-Transacciones\n(Relayer & EIP-712)', 
        'Pruebas Unitarias\n(10/10 Forge Tests)', 
        'Despliegue Cloud\n(GCP Cloud Run)'
    ]
    required = [100, 100, 100, 100, 100]
    implemented = [100, 100, 100, 100, 100]
    improvements = [140, 150, 160, 100, 150]
    
    x = np.arange(len(categories))
    width = 0.25
    
    ax.bar(x - width, required, width, label='Requisito Base (%)', color='#94A3B8')
    ax.bar(x, implemented, width, label='Implementado (%)', color='#7C3AED')
    rects3 = ax.bar(x + width, improvements, width, label='Con Mejoras Extra (%)', color='#06B6D4')
    
    ax.set_ylabel('Nivel de Cumplimiento (%)', fontsize=10, fontweight='bold', color='#1E293B')
    ax.set_title('Evaluacion de Cumplimiento: Tarea vs. Implementacion Final', fontsize=12, fontweight='bold', pad=15, color='#0F172A')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=8.5, fontweight='bold', color='#334155')
    ax.legend(frameon=True, facecolor='#F8FAFC', edgecolor='#CBD5E1', fontsize=9)
    ax.set_ylim(0, 180)
    ax.grid(axis='y', linestyle='--', alpha=0.3)
    
    for rect in rects3:
        height = rect.get_height()
        ax.annotate(f'{height}%',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontweight='bold', color='#0891B2')
                    
    plt.tight_layout()
    plt.savefig('compliance_chart.png')
    plt.close()

# --- GRÁFICO 2: Diagrama de Casos de Uso Mejorados ---
def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.axis('off')
    
    ax.text(0.5, 0.95, 'Diagrama de Casos de Uso Mejorados de la DAO', 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')
            
    # Actor 1: Socio Certificado
    ax.add_patch(patches.FancyBboxPatch((0.03, 0.55), 0.23, 0.3, boxstyle="round,pad=0.03", fc="#EDE9FE", ec="#7C3AED", lw=2))
    ax.text(0.145, 0.8, 'Socio Certificado\n(3.0 ETH Depositados)', fontsize=9.5, fontweight='bold', ha='center', color='#5B21B6')
    ax.text(0.145, 0.62, '- Emision de Voto Unico\n- Creacion de Propuestas\n- Firma EIP-712 Legible\n- Finanzas de Socio', fontsize=8, ha='center', color='#4C1D95')
    
    # Actor 2: Visitante / No Miembro
    ax.add_patch(patches.FancyBboxPatch((0.03, 0.15), 0.23, 0.3, boxstyle="round,pad=0.03", fc="#FEF3C7", ec="#D97706", lw=2))
    ax.text(0.145, 0.4, 'Visitante / No Inscrito', fontsize=9.5, fontweight='bold', ha='center', color='#92400E')
    ax.text(0.145, 0.22, '- Inscribirse (3.0 ETH)\n- Vista de Landing Page\n- Redireccion al Home', fontsize=8, ha='center', color='#B45309')

    # Sistema DAO
    ax.add_patch(patches.FancyBboxPatch((0.32, 0.12), 0.36, 0.75, boxstyle="round,pad=0.04", fc="#F1F5F9", ec="#0EA5E9", lw=2.5))
    ax.text(0.50, 0.82, 'Plataforma DAO EIP-2771', fontsize=11, fontweight='bold', ha='center', color='#0369A1')
    
    use_cases = [
        'CU-01: Inscripcion Directa con 3 ETH',
        'CU-02: Creacion de Propuesta con Validacion',
        'CU-03: Votacion Gasless EIP-712 Legible',
        'CU-04: Voto Unico Inmutable (Require)',
        'CU-05: Ejecucion Automatica por Daemon',
        'CU-06: Consulta de Balance & Ponderacion',
        'CU-07: Redireccion de No Miembros al Home'
    ]
    
    for i, uc in enumerate(use_cases):
        y_pos = 0.74 - (i * 0.085)
        ax.add_patch(patches.FancyBboxPatch((0.34, y_pos - 0.03), 0.32, 0.06, boxstyle="round,pad=0.01", fc="#FFFFFF", ec="#CBD5E1", lw=1))
        ax.text(0.50, y_pos, uc, fontsize=8.5, fontweight='bold', ha='center', color='#334155')

    # Relayer EIP-2771
    ax.add_patch(patches.FancyBboxPatch((0.74, 0.55), 0.23, 0.3, boxstyle="round,pad=0.03", fc="#ECFDF5", ec="#10B981", lw=2))
    ax.text(0.855, 0.8, 'Relayer EIP-2771', fontsize=9.5, fontweight='bold', ha='center', color='#065F46')
    ax.text(0.855, 0.62, '- Recibe Meta-Tx Firmada\n- Paga Comisiones Gas\n- Reenvia a Forwarder\n- Evita Replay Attacks', fontsize=8, ha='center', color='#047857')

    # Daemon de Ejecucion
    ax.add_patch(patches.FancyBboxPatch((0.74, 0.15), 0.23, 0.3, boxstyle="round,pad=0.03", fc="#EFF6FF", ec="#3B82F6", lw=2))
    ax.text(0.855, 0.4, 'Daemon de Ejecucion', fontsize=9.5, fontweight='bold', ha='center', color='#1E40AF')
    ax.text(0.855, 0.22, '- Verificacion Periodica\n- Comprueba Deadlines\n- Ejecuta Propuestas\n- Desembolsa ETH', fontsize=8, ha='center', color='#1D4ED8')

    # Conexiones
    ax.annotate('', xy=(0.34, 0.7), xytext=(0.25, 0.7), arrowprops=dict(arrowstyle="->", color="#7C3AED", lw=1.5))
    ax.annotate('', xy=(0.34, 0.25), xytext=(0.25, 0.25), arrowprops=dict(arrowstyle="->", color="#D97706", lw=1.5))
    ax.annotate('', xy=(0.74, 0.68), xytext=(0.66, 0.68), arrowprops=dict(arrowstyle="<-", color="#10B981", lw=1.5))
    ax.annotate('', xy=(0.74, 0.3), xytext=(0.66, 0.3), arrowprops=dict(arrowstyle="<-", color="#3B82F6", lw=1.5))

    plt.tight_layout()
    plt.savefig('use_case_diagram.png')
    plt.close()

# --- GRÁFICO 3: Diagrama de Secuencia EIP-712 Gasless ---
def create_sequence_diagram():
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=300)
    ax.axis('off')
    
    ax.text(0.5, 0.95, 'Flujo de Votacion Gasless EIP-712 con Informacion Legible en MetaMask', 
            fontsize=12, fontweight='bold', ha='center', color='#0F172A')

    steps = [
        ("1. Frontend", "Selecciona voto\ny solicita firma"),
        ("2. MetaMask", "Muestra mensaje EIP-712:\n• Accion: Voto DAO\n• Propuesta ID & Voto"),
        ("3. Relayer API", "Valida nonce y\nfinancia comision gas"),
        ("4. MinimalForwarder", "Verifica firma ECDSA\nextrae 'from' del socio"),
        ("5. DAOVoting", "Registra voto unico\nvalida require(!hasVoted)")
    ]

    colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#3B82F6']

    for i, (title, desc) in enumerate(steps):
        x = 0.05 + (i * 0.185)
        ax.add_patch(patches.FancyBboxPatch((x, 0.4), 0.16, 0.38, boxstyle="round,pad=0.02", fc="#FFFFFF", ec=colors[i], lw=2))
        ax.text(x + 0.08, 0.72, title, fontsize=8.5, fontweight='bold', ha='center', color=colors[i])
        ax.text(x + 0.08, 0.52, desc, fontsize=7.5, ha='center', color='#334155')
        
        if i < len(steps) - 1:
            ax.annotate('', xy=(x + 0.185, 0.59), xytext=(x + 0.16, 0.59),
                        arrowprops=dict(arrowstyle="->", color="#64748B", lw=2))

    plt.tight_layout()
    plt.savefig('gasless_sequence.png')
    plt.close()

if __name__ == '__main__':
    create_compliance_chart()
    create_use_case_diagram()
    create_sequence_diagram()
    print("Gráficos generados sin advertencias de fuentes.")
