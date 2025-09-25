import numpy as np
import scipy.stats as st
import customtkinter as ctk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import re
import threading

ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

HIST_COLOR = '#4A90E2'
THEORY_COLOR = '#D0021B'
BAR_COLOR_EMP = '#50C878'
BAR_COLOR_THEOR = '#FF6F61'


class DistributionApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Лабораторная работа 2")
        self.geometry("1300x800")
        self.create_widgets()

    def create_widgets(self):
        self.tabview = ctk.CTkTabview(self)
        self.tabview.pack(fill="both", expand=True, padx=10, pady=10)
        self.tabview.add("Непрерывные величины")
        self.tabview.add("Дискретные величины")
        self.create_continuous_tab()
        self.create_discrete_tab()

    def create_continuous_tab(self):
        tab = self.tabview.tab("Непрерывные величины")

        plots_frame = ctk.CTkFrame(tab)
        plots_frame.pack(fill="both", expand=True, padx=10, pady=(10, 0))

        self.cont_tabview = ctk.CTkTabview(plots_frame)
        self.cont_tabview.pack(fill="both", expand=True)

        self.cont_tabview.add("Гистограмма")
        self.cont_tabview.add("Q-Q Plot")
        self.cont_tabview.add("Результаты")

        input_frame = ctk.CTkFrame(tab)
        input_frame.pack(fill="x", padx=10, pady=10)

        title_label = ctk.CTkLabel(
            input_frame,
            text="Непрерывные величины (Нормальное распределение)",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        title_label.pack(pady=(10, 15))

        params_frame = ctk.CTkFrame(input_frame)
        params_frame.pack(fill="x", padx=20, pady=5)

        ctk.CTkLabel(params_frame, text="Объем выборки (n):").grid(row=0, column=0, padx=(10, 5), pady=5, sticky="w")
        self.cont_n_entry = ctk.CTkEntry(params_frame, width=100, placeholder_text="10000")
        self.cont_n_entry.insert(0, "10000")
        self.cont_n_entry.grid(row=0, column=1, padx=5, pady=5)

        ctk.CTkLabel(params_frame, text="Математическое ожидание (μ):").grid(row=0, column=2, padx=(20, 5), pady=5, sticky="w")
        self.cont_mu_entry = ctk.CTkEntry(params_frame, width=100, placeholder_text="0.0")
        self.cont_mu_entry.insert(0, "0.0")
        self.cont_mu_entry.grid(row=0, column=3, padx=5, pady=5)

        ctk.CTkLabel(params_frame, text="Стандартное отклонение (σ):").grid(row=0, column=4, padx=(20, 5), pady=5, sticky="w")
        self.cont_sigma_entry = ctk.CTkEntry(params_frame, width=100, placeholder_text="1.0")
        self.cont_sigma_entry.insert(0, "1.0")
        self.cont_sigma_entry.grid(row=0, column=5, padx=5, pady=5)

        button_frame = ctk.CTkFrame(input_frame)
        button_frame.pack(fill="x", padx=20, pady=10)

        self.cont_generate_btn = ctk.CTkButton(
            button_frame,
            text="Запустить",
            command=self.start_continuous_simulation,
            font=ctk.CTkFont(weight="bold"),
            width=200
        )
        self.cont_generate_btn.pack(side="left", padx=(0, 10))

        self.cont_progress = ctk.CTkProgressBar(button_frame, mode="indeterminate", width=300)
        self.cont_progress.pack(side="left", fill="x", expand=True)

        self.cont_results_text = ctk.CTkTextbox(input_frame, height=150)

        for i in range(6):
            params_frame.grid_columnconfigure(i, weight=1)

    def create_discrete_tab(self):
        tab = self.tabview.tab("Дискретные величины")

        plots_frame = ctk.CTkFrame(tab)
        plots_frame.pack(fill="both", expand=True, padx=10, pady=(10, 0))

        self.disc_tabview = ctk.CTkTabview(plots_frame)
        self.disc_tabview.pack(fill="both", expand=True)

        self.disc_tabview.add("Гистограмма")
        self.disc_tabview.add("Теоретическое распределение")
        self.disc_tabview.add("Результаты")

        input_frame = ctk.CTkFrame(tab)
        input_frame.pack(fill="x", padx=10, pady=10)

        title_label = ctk.CTkLabel(
            input_frame,
            text="Дискретные величины",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        title_label.pack(pady=(10, 15))

        params_frame = ctk.CTkFrame(input_frame)
        params_frame.pack(fill="x", padx=20, pady=5)

        ctk.CTkLabel(params_frame, text="Объем выборки (n):").grid(row=0, column=0, padx=(10, 5), pady=5, sticky="w")
        self.disc_n_entry = ctk.CTkEntry(params_frame, width=100, placeholder_text="10000")
        self.disc_n_entry.insert(0, "10000")
        self.disc_n_entry.grid(row=0, column=1, padx=5, pady=5)

        ctk.CTkLabel(params_frame, text="Значения (через запятую):").grid(row=0, column=2, padx=(20, 5), pady=5, sticky="w")
        self.values_entry = ctk.CTkEntry(params_frame, width=150, placeholder_text="1,2,3,4,5")
        self.values_entry.insert(0, "1,2,3,4,5")
        self.values_entry.grid(row=0, column=3, padx=5, pady=5)

        ctk.CTkLabel(params_frame, text="Вероятности (через запятую):").grid(row=0, column=4, padx=(20, 5), pady=5, sticky="w")
        self.probs_entry = ctk.CTkEntry(params_frame, width=150, placeholder_text="0.1,0.2,0.4,0.2,0.1")
        self.probs_entry.insert(0, "0.1,0.2,0.4,0.2,0.1")
        self.probs_entry.grid(row=0, column=5, padx=5, pady=5)

        hint_label = ctk.CTkLabel(
            params_frame,
            text="Разделители: запятая, пробел или точка с запятой. Если сумма ≠ 1 — нормализуем.",
            font=ctk.CTkFont(size=10),
            justify="left"
        )
        hint_label.grid(row=1, column=2, columnspan=4, padx=5, pady=(0, 5), sticky="w")

        button_frame = ctk.CTkFrame(input_frame)
        button_frame.pack(fill="x", padx=20, pady=10)

        self.disc_generate_btn = ctk.CTkButton(
            button_frame,
            text="Запустить",
            command=self.start_discrete_simulation,
            font=ctk.CTkFont(weight="bold"),
            width=200
        )
        self.disc_generate_btn.pack(side="left", padx=(0, 10))

        self.disc_progress = ctk.CTkProgressBar(button_frame, mode="indeterminate", width=300)
        self.disc_progress.pack(side="left", fill="x", expand=True)

        self.disc_results_text = ctk.CTkTextbox(input_frame, height=150)

        for i in range(6):
            params_frame.grid_columnconfigure(i, weight=1)

    def create_continuous_plots_area(self, parent):
        pass

    def create_discrete_plots_area(self, parent):
        pass

    def start_continuous_simulation(self):
        self.cont_generate_btn.configure(state="disabled", text="Выполняется...")
        self.cont_progress.start()
        threading.Thread(target=self.run_continuous_simulation, daemon=True).start()

    def run_continuous_simulation(self):
        try:
            n = int(self.cont_n_entry.get())
            mu = float(self.cont_mu_entry.get())
            sigma = float(self.cont_sigma_entry.get())
            if n <= 0 or sigma <= 0:
                raise ValueError("n > 0, σ > 0")

            Y = self.simulate_normal(n, mu, sigma)
            results = self.analyze_continuous_distribution(Y, mu, sigma)
            self.after(0, lambda: self.update_continuous_results(results, Y, mu, sigma))
        except Exception as e:
            self.after(0, lambda: self.show_continuous_error(str(e)))

    def simulate_normal(self, n, mu, sigma):
        # Метод обратных функций для нормального распределения через scipy
        U = np.random.rand(n)
        return st.norm.ppf(U, loc=mu, scale=sigma)

    def analyze_continuous_distribution(self, Y, mu, sigma):
        n = len(Y)
        mean_est = np.mean(Y)
        var_est = np.var(Y, ddof=1)
        mean_theor = mu
        var_theor = sigma ** 2

        alpha = 0.05
        mean_ci = st.t.interval(1 - alpha, n - 1, loc=mean_est, scale=st.sem(Y))

        ks_stat, ks_p = st.kstest(Y, 'norm', args=(mu, sigma))

        shapiro_p = None
        if n <= 5000:
            _, shapiro_p = st.shapiro(Y)

        return {
            'n': n, 'mu': mu, 'sigma': sigma,
            'mean_est': mean_est, 'var_est': var_est,
            'mean_theor': mean_theor, 'var_theor': var_theor,
            'mean_ci': mean_ci,
            'ks_stat': ks_stat, 'ks_p': ks_p,
            'shapiro_p': shapiro_p
        }

    def update_continuous_results(self, results, Y, mu, sigma):
        self.cont_progress.stop()
        text = f"""АНАЛИЗ НОРМАЛЬНОГО РАСПРЕДЕЛЕНИЯ
{'='*50}
Объем выборки: {results['n']}
Параметры: μ = {results['mu']:.2f}, σ = {results['sigma']:.2f}

ТОЧЕЧНЫЕ ОЦЕНКИ:
  Среднее (выб.): {results['mean_est']:.4f} | (теор.): {results['mean_theor']:.4f}
  Дисперсия (выб.): {results['var_est']:.4f} | (теор.): {results['var_theor']:.4f}

ДОВЕРИТЕЛЬНЫЙ ИНТЕРВАЛ (95%):
  Мат. ожидание: ({results['mean_ci'][0]:.4f}, {results['mean_ci'][1]:.4f})

ПРОВЕРКА ГИПОТЕЗ О НОРМАЛЬНОСТИ:
  Kolmogorov-Smirnov:
    Статистика: {results['ks_stat']:.4f}
    p-значение: {results['ks_p']:.4f} → {'Не отклоняем H₀' if results['ks_p'] > 0.05 else 'Отклоняем H₀'}
"""
        if results['shapiro_p'] is not None:
            text += f"""  Shapiro-Wilk (n≤5000):
    p-значение: {results['shapiro_p']:.4f} → {'Не отклоняем H₀' if results['shapiro_p'] > 0.05 else 'Отклоняем H₀'}
"""
        self.cont_results_text.delete("1.0", "end")
        self.cont_results_text.insert("1.0", text)
        self.create_continuous_plots(Y, mu, sigma)
        self.cont_generate_btn.configure(state="normal", text="Запустить")

    def create_continuous_plots(self, Y, mu, sigma):
        for tab_name in ["Гистограмма", "Q-Q Plot", "Результаты"]:
            for widget in self.cont_tabview.tab(tab_name).winfo_children():
                widget.destroy()

        fig1 = Figure(figsize=(6, 4), dpi=100)
        ax1 = fig1.add_subplot(111)
        ax1.hist(Y, bins=50, density=True, alpha=0.6, color=HIST_COLOR, edgecolor="black", label='Выборка')
        x = np.linspace(mu - 4*sigma, mu + 4*sigma, 200)
        ax1.plot(x, st.norm.pdf(x, mu, sigma), color=THEORY_COLOR, lw=2, label='Теоретическая плотность')
        ax1.set_title("Гистограмма и теоретическая плотность")
        ax1.set_xlabel("Значение")
        ax1.set_ylabel("Плотность")
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        FigureCanvasTkAgg(fig1, self.cont_tabview.tab("Гистограмма")).get_tk_widget().pack(fill="both", expand=True)

        fig2 = Figure(figsize=(6, 4), dpi=100)
        ax2 = fig2.add_subplot(111)
        st.probplot(Y, dist=st.norm, sparams=(mu, sigma), plot=ax2)
        ax2.set_title("Q-Q Plot (нормальное распределение)")
        FigureCanvasTkAgg(fig2, self.cont_tabview.tab("Q-Q Plot")).get_tk_widget().pack(fill="both", expand=True)

        hyp_frame = ctk.CTkFrame(self.cont_tabview.tab("Результаты"))
        hyp_frame.pack(fill="both", expand=True, padx=10, pady=10)
        hyp_text = ctk.CTkTextbox(hyp_frame)
        hyp_text.pack(fill="both", expand=True)
        hyp_text.insert("1.0", self.cont_results_text.get("1.0", "end"))

    def show_continuous_error(self, message):
        self.cont_progress.stop()
        self.cont_results_text.delete("1.0", "end")
        self.cont_results_text.insert("1.0", f"Ошибка: {message}")
        self.cont_generate_btn.configure(state="normal", text="Запустить")

    def start_discrete_simulation(self):
        self.disc_generate_btn.configure(state="disabled", text="Выполняется...")
        self.disc_progress.start()
        threading.Thread(target=self.run_discrete_simulation, daemon=True).start()

    def run_discrete_simulation(self):
        try:
            n = int(self.disc_n_entry.get())
            if n <= 0:
                raise ValueError("Объем выборки должен быть положительным")

            values_str = self.values_entry.get().strip()
            probs_str = self.probs_entry.get().strip()

            def parse_list(s):
                parts = re.split(r'[,\s;]+', s.strip())
                return [p for p in parts if p]

            val_parts = parse_list(values_str)
            prob_parts = parse_list(probs_str)

            if not val_parts or not prob_parts:
                raise ValueError("Значения и вероятности не должны быть пустыми")
            if len(val_parts) != len(prob_parts):
                raise ValueError("Количество значений и вероятностей должно совпадать")

            values = []
            for v in val_parts:
                try:
                    v_num = float(v.replace(',', '.'))
                    values.append(int(v_num) if v_num.is_integer() else v_num)
                except:
                    raise ValueError(f"Некорректное значение: {v}")

            probabilities = []
            for p in prob_parts:
                try:
                    p_num = float(p.replace(',', '.'))
                    if p_num < 0:
                        raise ValueError("Вероятности не могут быть отрицательными")
                    probabilities.append(p_num)
                except:
                    raise ValueError(f"Некорректная вероятность: {p}")

            total = sum(probabilities)
            if abs(total - 1.0) > 1e-6:
                probabilities = [p / total for p in probabilities]

            Y = self.simulate_discrete(n, values, probabilities)
            results = self.analyze_discrete_distribution(Y, values, probabilities)
            self.after(0, lambda: self.update_discrete_results(results, Y))
        except Exception as e:
            self.after(0, lambda: self.show_discrete_error(str(e)))

    def simulate_discrete(self, n, values, probabilities):
        return np.random.choice(values, size=n, p=probabilities)

    def analyze_discrete_distribution(self, Y, values, probabilities):
        n = len(Y)
        empirical_probs = [np.mean(Y == v) for v in values]
        mean_est = np.mean(Y)
        var_est = np.var(Y, ddof=1)
        mean_theor = sum(v * p for v, p in zip(values, probabilities))
        var_theor = sum((v - mean_theor) ** 2 * p for v, p in zip(values, probabilities))

        observed = [np.sum(Y == v) for v in values]
        expected = [n * p for p in probabilities]
        chi2_stat, chi2_p = st.chisquare(observed, expected)

        return {
            'n': n, 'values': values, 'probabilities': probabilities,
            'empirical_probs': empirical_probs,
            'mean_est': mean_est, 'var_est': var_est,
            'mean_theor': mean_theor, 'var_theor': var_theor,
            'chi2_stat': chi2_stat, 'chi2_p': chi2_p
        }

    def update_discrete_results(self, results, Y):
        self.disc_progress.stop()
        text = f"""АНАЛИЗ ДИСКРЕТНОГО РАСПРЕДЕЛЕНИЯ
{'='*50}
Объем выборки: {results['n']}
Значения: {results['values']}
Теоретические вероятности: {[f'{p:.3f}' for p in results['probabilities']]}

ЭМПИРИЧЕСКИЕ ВЕРОЯТНОСТИ:
"""
        for v, p_theor, p_emp in zip(results['values'], results['probabilities'], results['empirical_probs']):
            text += f"  Y={v}: теор. {p_theor:.3f} → эмп. {p_emp:.3f}\n"

        text += f"""
ТОЧЕЧНЫЕ ОЦЕНКИ:
  Среднее (выб.): {results['mean_est']:.4f} | (теор.): {results['mean_theor']:.4f}
  Дисперсия (выб.): {results['var_est']:.4f} | (теор.): {results['var_theor']:.4f}

ПРОВЕРКА ГИПОТЕЗ (χ² Пирсона):
  Статистика: {results['chi2_stat']:.4f}
  p-значение: {results['chi2_p']:.4f} → {'Не отклоняем H₀' if results['chi2_p'] > 0.05 else 'Отклоняем H₀'}
"""
        self.disc_results_text.delete("1.0", "end")
        self.disc_results_text.insert("1.0", text)
        self.create_discrete_plots(results, Y)
        self.disc_generate_btn.configure(state="normal", text="Запустить")

    def create_discrete_plots(self, results, Y):
        for tab_name in ["Гистограмма", "Теоретическое распределение", "Результаты"]:
            for widget in self.disc_tabview.tab(tab_name).winfo_children():
                widget.destroy()

        values = results['values']
        emp_probs = results['empirical_probs']
        theor_probs = results['probabilities']

        fig1 = Figure(figsize=(6, 4), dpi=100)
        ax1 = fig1.add_subplot(111)
        bars = ax1.bar(values, emp_probs, color=BAR_COLOR_EMP, edgecolor='black', alpha=0.8)
        for bar, p in zip(bars, emp_probs):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, f'{p:.3f}', ha='center')
        ax1.set_title("Эмпирическое распределение")
        ax1.set_xlabel("Значения")
        ax1.set_ylabel("Вероятности")
        ax1.grid(True, alpha=0.3)
        FigureCanvasTkAgg(fig1, self.disc_tabview.tab("Гистограмма")).get_tk_widget().pack(fill="both", expand=True)

        fig2 = Figure(figsize=(6, 4), dpi=100)
        ax2 = fig2.add_subplot(111)
        bars = ax2.bar(values, theor_probs, color=BAR_COLOR_THEOR, edgecolor='black', alpha=0.8)
        for bar, p in zip(bars, theor_probs):
            ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, f'{p:.3f}', ha='center')
        ax2.set_title("Теоретическое распределение")
        ax2.set_xlabel("Значения")
        ax2.set_ylabel("Вероятности")
        ax2.grid(True, alpha=0.3)
        FigureCanvasTkAgg(fig2, self.disc_tabview.tab("Теоретическое распределение")).get_tk_widget().pack(fill="both", expand=True)

        hyp_frame = ctk.CTkFrame(self.disc_tabview.tab("Результаты"))
        hyp_frame.pack(fill="both", expand=True, padx=10, pady=10)
        hyp_text = ctk.CTkTextbox(hyp_frame)
        hyp_text.pack(fill="both", expand=True)
        hyp_text.insert("1.0", self.disc_results_text.get("1.0", "end"))

    def show_discrete_error(self, message):
        self.disc_progress.stop()
        self.disc_results_text.delete("1.0", "end")
        self.disc_results_text.insert("1.0", f"Ошибка: {message}")
        self.disc_generate_btn.configure(state="normal", text="Запустить")


if __name__ == "__main__":
    app = DistributionApp()
    app.mainloop()
