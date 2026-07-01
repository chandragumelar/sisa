import type { Language } from '@/db/database'

export type StringKey =
  // common
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.close'
  | 'common.back_aria'
  | 'common.ok'
  | 'common.confirm'
  | 'common.add'
  | 'common.today'
  | 'common.yesterday'
  | 'common.saving'
  | 'common.day'
  | 'common.days'
  // update banner
  | 'update_banner.msg'
  | 'update_banner.reload'
  // onboarding install guide
  | 'ob.install.heading'
  | 'ob.install.ios_label'
  | 'ob.install.ios_step1'
  | 'ob.install.ios_step2'
  | 'ob.install.ios_step3'
  | 'ob.install.ios_hint'
  | 'ob.install.android_label'
  | 'ob.install.android_step1'
  | 'ob.install.android_step2'
  | 'ob.install.android_step3'
  | 'ob.install.cta'
  | 'ob.install.skip'
  // onboarding step 2
  | 'ob.step2.heading'
  | 'ob.step2.sub'
  | 'ob.step2.hint'
  | 'ob.step2.verify'
  | 'ob.step2.activate'
  | 'ob.step2.buy_cta'
  | 'ob.step2.err_expired'
  | 'ob.step2.err_invalid'
  | 'ob.step2.err_other'
  // onboarding step 3
  | 'ob.step3.heading'
  | 'ob.step3.body1'
  | 'ob.step3.body2'
  | 'ob.step3.next'
  | 'ob.step3.skip'
  // onboarding step 4a
  | 'ob.step4a.heading'
  | 'ob.step4a.sub'
  | 'ob.step4a.tetap_label'
  | 'ob.step4a.tetap_sub'
  | 'ob.step4a.freelance_label'
  | 'ob.step4a.freelance_sub'
  | 'ob.step4a.mix_label'
  | 'ob.step4a.mix_sub'
  | 'ob.step4a.next'
  // onboarding step 4b
  | 'ob.step4b.heading_tetap'
  | 'ob.step4b.heading_mix'
  | 'ob.step4b.heading_freelance'
  | 'ob.step4b.sub_tetap'
  | 'ob.step4b.sub_mix'
  | 'ob.step4b.sub_freelance'
  | 'ob.step4b.payday_label'
  | 'ob.step4b.payday_placeholder'
  | 'ob.step4b.payday_day'
  | 'ob.step4b.freq_label'
  | 'ob.step4b.freq_bulanan'
  | 'ob.step4b.freq_mingguan'
  | 'ob.step4b.freq_2mingguan'
  | 'ob.step4b.anchor_label'
  | 'ob.step4b.anchor_hint'
  | 'ob.step4b.min_balance_optional'
  | 'ob.step4b.min_balance_required'
  | 'ob.step4b.min_balance_hint'
  | 'ob.step4b.avg_income_label'
  | 'ob.step4b.avg_income_basis_label'
  | 'ob.step4b.avg_income_hint'
  | 'ob.step4b.fixed_income_label_tetap'
  | 'ob.step4b.fixed_income_label_mix'
  | 'ob.step4b.fixed_income_hint'
  | 'ob.step4b.next'
  // onboarding step payConfirm (3-option: preset / picker / first-time)
  | 'ob.payConfirm.heading'
  | 'ob.payConfirm.sub'
  | 'ob.payConfirm.preset_prefix'
  | 'ob.payConfirm.picker_label'
  | 'ob.payConfirm.first_label'
  | 'ob.payConfirm.first_sub'
  | 'ob.payConfirm.next'
  // home — transisi periode banner (H-2)
  | 'home.transisi_heading'
  | 'home.transisi_sub'
  | 'home.transisi_btn'
  | 'home.transisi_popup_heading'
  | 'home.transisi_popup_body'
  | 'home.transisi_popup_date_label'
  | 'home.transisi_popup_nominal_label'
  | 'home.transisi_popup_confirm'
  | 'home.transisi_popup_cancel'
  // onboarding step langCurrency (language + main currency combined)
  | 'ob.langCurrency.currency_label'
  | 'ob.langCurrency.currency_placeholder'
  | 'ob.langCurrency.explainer'
  // onboarding step 4c (kept for reference, no longer rendered)
  | 'ob.step4c.heading'
  | 'ob.step4c.sub'
  | 'ob.step4c.placeholder'
  | 'ob.step4c.next'
  // onboarding step 4d
  | 'ob.step4d.heading'
  | 'ob.step4d.sub'
  | 'ob.step4d.wallet_label'
  | 'ob.step4d.balance_label'
  | 'ob.step4d.add_more'
  | 'ob.step4d.next'
  | 'ob.step4d.remove_aria'
  | 'ob.step4d.placeholder_first'
  | 'ob.step4d.placeholder_other'
  | 'ob.step4d.currency_label'
  // currency picker
  | 'currency_picker.search'
  | 'currency_picker.popular'
  | 'currency_picker.all'
  | 'currency_picker.empty'
  | 'currency_picker.aria'
  // budget module
  | 'budget.title'
  | 'budget.info_aria'
  | 'budget.desc_line'
  | 'budget.spent'
  | 'budget.left_today'
  | 'budget.week_title'
  | 'budget.week_days'
  | 'budget.bills_title'
  | 'budget.empty_balance'
  | 'budget.sheet_title'
  // saldo module
  | 'saldo.title'
  | 'saldo.toggle_aria'
  | 'saldo.no_wallets'
  | 'saldo.spent_yesterday'
  | 'saldo.income_yesterday'
  | 'saldo.total'
  | 'saldo.tagihan'
  | 'saldo.nabung'
  | 'saldo.sisa'
  | 'saldo.income_month'
  | 'saldo.expense_month'
  | 'saldo.verdict_near_limit'
  | 'saldo.verdict_below_limit'
  | 'saldo.formula_title'
  | 'saldo.formula_intro'
  | 'saldo.formula_total_wallets'
  | 'saldo.formula_bills_label'
  | 'saldo.formula_bills_sublabel'
  | 'saldo.formula_savings_label'
  | 'saldo.formula_savings_sublabel'
  | 'saldo.formula_total_label'
  | 'saldo.formula_note'
  // saldo module — 3-layer redesign
  | 'saldo.jatah_harian_label'
  | 'saldo.jatah_harian_tooltip'
  | 'saldo.anggaran_tooltip'
  | 'saldo.expand_btn'
  | 'saldo.collapse_btn'
  | 'saldo.rincian_tagihan'
  | 'saldo.rincian_nabung'
  | 'saldo.rincian_anggaran'
  | 'saldo.rincian_hari_periode'
  | 'saldo.rincian_jatah'
  | 'saldo.rincian_udah_jalan'
  | 'saldo.total_saldo_label'
  | 'saldo.uang_mengendap_label'
  | 'saldo.uang_mengendap_sub'
  | 'saldo.rincian_udah_kepakai'
  | 'saldo.sisa_periode_label'
  | 'saldo.uang_mengendap_tooltip'
  // saldo module — mode: bertahan
  | 'saldo.mode_bertahan_badge'
  | 'saldo.mode_bertahan_msg'
  | 'saldo.mode_bertahan_shortfall_label'
  | 'saldo.mode_bertahan_aman_mulai'
  | 'saldo.mode_bertahan_note'
  // saldo module — mode: hari gajian
  | 'saldo.mode_harigajian_badge'
  | 'saldo.mode_harigajian_heading'
  | 'saldo.mode_harigajian_sub'
  | 'saldo.mode_harigajian_yes'
  | 'saldo.mode_harigajian_no'
  | 'saldo.mode_harigajian_ringkasan'
  | 'saldo.mode_harigajian_sisa_anggaran'
  | 'saldo.mode_harigajian_total_saldo'
  | 'saldo.mode_harigajian_uang_mengendap'
  // saldo module — mode: hari terakhir
  | 'saldo.mode_hariterakhir_badge'
  | 'saldo.mode_hariterakhir_sub_label'
  | 'saldo.mode_hariterakhir_note'
  // tagihan module
  | 'tagihan_module.title'
  | 'tagihan_module.empty_text'
  | 'tagihan_module.more'
  | 'tagihan_module.swipe_hint'
  | 'tagihan_module.add'
  | 'tagihan_module.chip_unpaid'
  | 'tagihan_module.chip_paid'
  | 'tagihan_module.unpaid_label'
  | 'tagihan_module.pill_unpaid'
  | 'tagihan_module.pill_paid'
  | 'tagihan_module.idr_lunas'
  | 'tagihan_module.all_paid'
  | 'tagihan_module.all_paid_sub'
  | 'tagihan_module.ctx_total'
  | 'tagihan_module.ctx_paid'
  // notif card
  | 'notif.both'
  | 'notif.overdue'
  | 'notif.due_today'
  | 'notif.extra'
  // backup card
  | 'backup.title_urgent'
  | 'backup.title_normal'
  | 'backup.desc'
  | 'backup.guide_btn'
  | 'backup.guide_title'
  | 'backup.guide_got_it'
  // footer catatan
  | 'footer.last_recorded'
  | 'footer.minutes_ago'
  | 'footer.hours_ago'
  | 'footer.days_ago'
  | 'footer.no_records'
  | 'footer.all_records'
  | 'footer.tx_fallback'
  // bottom action bar
  | 'actions.log_aria'
  | 'actions.log_label'
  | 'actions.cek_aria'
  | 'actions.cek_label'
  | 'actions.cek_sub'
  | 'actions.andai_aria'
  | 'actions.andai_label'
  | 'actions.log_full_label'
  // decision hero card
  | 'decision.heading_line1'
  | 'decision.heading_line2'
  | 'decision.input_placeholder'
  | 'decision.cek_btn'
  | 'decision.andai_prefix'
  | 'decision.andai_link'
  // cek dulu adaptive card states
  | 'cek.empty.heading'
  | 'cek.empty.body'
  | 'cek.empty.cta'
  | 'cek.badge_estimasi'
  | 'cek.badge_akurat'
  | 'cek.section_label'
  | 'cek.item_tagihan'
  | 'cek.item_wallet'
  | 'cek.item_tabungan'
  | 'cek.done_tagihan'
  | 'cek.need_fill'
  | 'cek.optional'
  | 'cek.disclaimer'
  | 'cek.row_sisa'
  | 'cek.row_tagihan'
  | 'cek.andai_warning'
  | 'cek.cta_add'
  | 'cek.nabung_cta'
  // history sheet
  | 'history.title'
  | 'history.filter_all'
  | 'history.filter_keluar'
  | 'history.filter_masuk'
  | 'history.filter_nabung'
  | 'history.empty'
  | 'history.type_keluar'
  | 'history.type_masuk'
  | 'history.type_nabung'
  | 'history.type_tagihan'
  | 'history.type_transfer'
  | 'history.today'
  | 'history.yesterday'
  | 'history.edit_aria'
  | 'history.delete_aria'
  // mark paid sheet
  | 'mark_paid.title'
  | 'mark_paid.nominal'
  | 'mark_paid.from'
  | 'mark_paid.date_label'
  | 'mark_paid.estimate'
  | 'mark_paid.insufficient'
  | 'mark_paid.submit'
  // tagihan detail sheet
  | 'tagihan_detail.due_date_label'
  | 'tagihan_detail.nominal'
  | 'tagihan_detail.due_day'
  | 'tagihan_detail.status'
  | 'tagihan_detail.last_paid'
  | 'tagihan_detail.status_paid'
  | 'tagihan_detail.status_overdue'
  | 'tagihan_detail.status_due_today'
  | 'tagihan_detail.status_unpaid'
  | 'tagihan_detail.mark_paid'
  | 'tagihan_detail.delete_confirm'
  | 'tagihan_detail.urgent_title'
  | 'tagihan_detail.overdue_days'
  | 'tagihan_detail.due_today'
  | 'tagihan_detail.pay_btn'
  // tagihan swipe row
  | 'tagihan_swipe.mark_paid_aria'
  | 'tagihan_swipe.mark_paid_label'
  | 'tagihan_swipe.paid_badge'
  // toast
  | 'toast.edit'
  | 'toast.undo'
  // home toast messages
  | 'home.toast_paid'
  | 'home.toast_masuk'
  | 'home.toast_keluar'
  | 'home.days_to_payday'
  | 'home.day_to_payday'
  | 'home.saldo_bebas'
  | 'home.monthly_title'
  | 'home.income_label'
  | 'home.expense_label'
  | 'home.savings_label'
  | 'home.payday_confirm_title'
  | 'home.payday_confirm_sub'
  | 'home.payday_confirm_yes'
  | 'home.payday_confirm_no'
  // equiv line (shared)
  | 'equiv.approx'
  // wallets card — multi-currency
  | 'wallets.total_label'
  | 'wallets.total_label_fallback'
  | 'wallets.fallback_note'
  | 'wallets.rate_unavailable'
  | 'wallets.collapse'
  // push notification permission prompt
  | 'push.ask_title'
  | 'push.ask_body'
  | 'push.ask_cta'
  | 'push.ask_later'
  // quick log sheet
  | 'quick_log.mode_keluar'
  | 'quick_log.mode_masuk'
  | 'quick_log.date_label'
  | 'quick_log.date_custom_aria'
  | 'quick_log.submitting'
  | 'quick_log.submit_edit'
  | 'quick_log.submit_new'
  | 'quick_log.label_placeholder'
  | 'category.manage_btn'
  // category management
  | 'settings.row_categories'
  | 'settings.row_categories_sub'
  // cek dulu page
  | 'cek_dulu.title'
  | 'cek_dulu.sub'
  | 'cek_dulu.close_aria'
  | 'cek_dulu.price_label'
  | 'cek_dulu.context_line'
  | 'cek_dulu.col_now'
  | 'cek_dulu.col_after'
  | 'cek_dulu.daily_label'
  | 'cek_dulu.daily_unit'
  | 'cek_dulu.sisa_label'
  | 'cek_dulu.new_flag'
  | 'cek_dulu.mengendap_label'
  | 'cek_dulu.mengendap_note'
  | 'cek_dulu.src_label'
  | 'cek_dulu.src_wallets'
  | 'cek_dulu.close_btn'
  | 'cek_dulu.buy_label'
  | 'cek_dulu.buy_sub'
  | 'cek_dulu.insight_days'
  | 'cek_dulu.insight_portion'
  | 'cek_dulu.insight_recovery'
  // andai page
  | 'andai.title'
  | 'andai.sub'
  | 'andai.back_aria'
  | 'andai.baseline_label'
  | 'andai.baseline_saldo'
  | 'andai.stack_label'
  | 'andai.remove_aria'
  | 'andai.kind_beli'
  | 'andai.kind_income'
  | 'andai.kind_tagihan'
  | 'andai.result_label'
  | 'andai.result_daily'
  | 'andai.result_sisa'
  | 'andai.reset'
  | 'andai.save'
  | 'andai.compare'
  | 'andai.compare_bar'
  | 'andai.add_event'
  | 'andai.add_desc_label'
  | 'andai.add_nominal_label'
  | 'andai.add_submit'
  | 'andai.placeholder_beli'
  | 'andai.placeholder_income'
  | 'andai.placeholder_tagihan'
  | 'andai.scenarios_label'
  | 'andai.scenarios_delete_aria'
  | 'andai.scenarios_delete_label'
  | 'andai.save_sheet_title'
  | 'andai.save_sheet_label'
  | 'andai.save_sheet_placeholder'
  | 'andai.save_sheet_submit'
  | 'andai.compare_sheet_title'
  | 'andai.compare_daily'
  | 'andai.compare_sisa'
  | 'andai.insight_days'
  | 'andai.insight_portion'
  | 'andai.insight_recovery'
  | 'andai.baseline_mengendap'
  | 'andai.income_disclaimer'
  // profil – wallets
  | 'profil.wallets_title_list'
  | 'profil.wallets_title_add'
  | 'profil.wallets_name_label'
  | 'profil.wallets_balance_label'
  | 'profil.wallets_sesuaikan_btn'
  | 'profil.wallets_delete_btn'
  | 'profil.wallets_delete_confirm'
  | 'profil.wallets_diff_prefix'
  | 'profil.wallets_diff_from'
  | 'profil.wallets_opt_lupa'
  | 'profil.wallets_opt_transfer'
  | 'profil.wallets_transfer_pick_label'
  | 'profil.wallets_transfer_confirm'
  | 'profil.wallets_initial_balance'
  | 'profil.wallets_add_btn'
  | 'profil.wallets_add_placeholder'
  | 'profil.wallets_add_more'
  | 'profil.wallets_currency_label'
  // profil – income
  | 'profil.income_title'
  | 'profil.income_type_label'
  | 'profil.income_type_tetap'
  | 'profil.income_type_freelance'
  | 'profil.income_type_mix'
  | 'profil.income_day_label'
  | 'profil.income_weekend_label'
  | 'profil.income_weekend_maju'
  | 'profil.income_weekend_mundur'
  | 'profil.income_weekend_tetap'
  | 'profil.income_freelance_note'
  | 'profil.income_save'
  // profil – license
  | 'profil.license_title'
  | 'profil.license_status_label'
  | 'profil.license_active'
  | 'profil.license_expires_label'
  | 'profil.license_days_left'
  | 'profil.license_not_active'
  | 'profil.license_change'
  | 'profil.license_enter'
  | 'profil.license_verifying'
  | 'profil.license_activate'
  | 'profil.license_buy_label'
  | 'profil.license_err_invalid'
  | 'profil.license_err_expired'
  | 'profil.license_success'
  // profil – tagihan
  | 'profil.tagihan_currency_label'
  | 'profil.tagihan_title_list'
  | 'profil.tagihan_title_edit'
  | 'profil.tagihan_title_add'
  | 'profil.tagihan_empty'
  | 'profil.tagihan_name_label'
  | 'profil.tagihan_name_placeholder'
  | 'profil.tagihan_nominal_label'
  | 'profil.tagihan_fixed'
  | 'profil.tagihan_variable'
  | 'profil.tagihan_due_label'
  | 'profil.tagihan_freq_label'
  | 'profil.tagihan_rutin'
  | 'profil.tagihan_sekali'
  | 'profil.tagihan_freq_sekali'
  | 'profil.tagihan_freq_mingguan'
  | 'profil.tagihan_freq_2mingguan'
  | 'profil.tagihan_freq_bulanan'
  | 'profil.tagihan_freq_2bulanan'
  | 'profil.tagihan_freq_3bulanan'
  | 'profil.tagihan_freq_tahunan'
  | 'profil.tagihan_date_label'
  | 'profil.tagihan_weekday_label'
  | 'profil.tagihan_anchor_month_label'
  | 'profil.tagihan_annual_month_label'
  | 'profil.tagihan_add_btn'
  // settings page
  | 'settings.title'
  | 'settings.back_aria'
  | 'settings.profile_active_until'
  | 'settings.profile_not_active'
  | 'settings.section_profil'
  | 'settings.row_income'
  | 'settings.row_income_sub'
  | 'settings.section_tampilan'
  | 'settings.row_theme'
  | 'settings.theme_light'
  | 'settings.theme_dark'
  | 'settings.theme_system'
  | 'settings.dark_note'
  | 'settings.row_language'
  | 'settings.row_patokan_currency'
  | 'settings.row_patokan_currency_sub'
  | 'settings.currency_warning_title'
  | 'settings.currency_warning_body'
  | 'settings.section_data'
  | 'settings.export_json'
  | 'settings.export_json_sub'
  | 'settings.export_csv'
  | 'settings.export_csv_sub'
  | 'settings.import'
  | 'settings.import_sub'
  | 'settings.delete'
  | 'settings.delete_sub'
  | 'settings.section_about'
  | 'settings.made_by'
  | 'settings.contact'
  | 'settings.email'
  | 'settings.import_preview_title'
  | 'settings.import_preview_wallets'
  | 'settings.import_preview_txs'
  | 'settings.import_preview_bills'
  | 'settings.import_preview_goals'
  | 'settings.import_warning'
  | 'settings.import_confirm'
  | 'settings.import_error_title'
  | 'settings.delete_title'
  | 'settings.delete_warning'
  | 'settings.delete_next'
  | 'settings.delete_type_prompt'
  | 'settings.delete_type_word'
  | 'settings.delete_type_placeholder'
  | 'settings.delete_confirm_btn'
  // alokasi editor
  | 'alokasi.buat_dipakai'
  | 'alokasi.uang_mengendap'
  | 'alokasi.mengendap_note'
  | 'alokasi.jatah_harian_approx'
  | 'alokasi.sampai_gajian'
  | 'alokasi.sampai_akhir_bulan'
  | 'alokasi.atur_ulang_title'
  | 'alokasi.bisa_kamu_atur'
  | 'alokasi.ubah_dipakai'
  | 'alokasi.mengendap_auto'
  // home — new allocation model strings
  | 'home.sisa_uang'
  | 'home.sisa_uang_tooltip'
  | 'home.insight_teaser_ratio'
  | 'home.insight_teaser_clean'
  | 'home.insight_teaser_spend_only'
  | 'home.insight_teaser_generic'
  | 'home.insight_card_label'
  | 'home.insight_card_cta'
  | 'home.expand_show'
  | 'home.expand_hide'
  | 'home.duit_di_mana'
  | 'home.bulan_ini'
  | 'home.lihat_riwayat'
  | 'home.dompet'
  | 'home.tambah_dompet'
  | 'home.wallets_empty_title'
  | 'home.wallets_empty_sub'
  | 'home.wallets_more'
  | 'home.atur_alokasi'
  | 'home.banner_gajian_title'
  | 'home.banner_gajian_body'
  | 'home.banner_periode_title'
  | 'home.banner_periode_body'
  | 'home.banner_cta'
  | 'home.jatah_harian_label'
  | 'home.jatah_keluar'
  | 'home.jatah_lewat_badge'
  | 'home.jatah_lewat_title'
  | 'home.jatah_besok'
  // insight
  | 'insight.back_aria'
  | 'insight.hero_hemat'
  | 'insight.hero_hemat_sub'
  | 'insight.hero_boros'
  | 'insight.hero_boros_sub'
  | 'insight.hero_ratio'
  | 'insight.hero_ratio_sub'
  | 'insight.hero_neutral_calm'
  | 'insight.hero_neutral_fresh'
  | 'insight.hero_neutral_sub'
  | 'insight.card_monthly'
  | 'insight.metric_net'
  | 'insight.metric_keluar'
  | 'insight.metric_masuk'
  | 'insight.monthly_label_expense'
  | 'insight.monthly_label_income'
  | 'insight.monthly_delta_less'
  | 'insight.monthly_delta_more'
  | 'insight.monthly_delta_income_up'
  | 'insight.monthly_delta_income_down'
  | 'insight.monthly_delta_net_up'
  | 'insight.monthly_delta_net_down'
  | 'insight.monthly_empty'
  | 'insight.monthly_empty_sub'
  | 'insight.card_category'
  | 'insight.cat_empty'
  | 'insight.cat_empty_sub'
  | 'insight.cat_delta_up'
  | 'insight.cat_delta_down'
  | 'insight.cat_no_prev'
  | 'insight.cat_pct_of_total'
  | 'insight.card_spend_pct'
  | 'insight.spend_pct_from'
  | 'insight.spend_pct_used'
  | 'insight.spend_pct_left'
  | 'insight.spend_pct_empty'
  | 'insight.spend_pct_empty_sub'
  | 'insight.card_daily'
  | 'insight.daily_empty'
  | 'insight.daily_empty_sub'
  | 'insight.daily_legend_low'
  | 'insight.daily_legend_high'
  | 'insight.daily_sheet_empty'
  | 'insight.daily_sheet_total'
  | 'insight.card_ranking'
  | 'insight.ranking_vs'
  | 'insight.ranking_empty'
  | 'insight.ranking_empty_sub'
  | 'insight.card_top_tx'
  | 'insight.top_tx_empty'
  | 'insight.top_tx_empty_sub'
  | 'insight.fx_skip'
  | 'insight.nav_aria'

export type StringDictionary = Record<StringKey, string>

const id: StringDictionary = {
  'common.save': 'Simpan',
  'common.cancel': 'Batal',
  'common.delete': 'Hapus',
  'common.close': 'Tutup',
  'common.back_aria': 'Kembali',
  'common.ok': 'Oke',
  'common.confirm': 'Konfirmasi',
  'common.add': 'Tambah',
  'common.today': 'Hari ini',
  'common.yesterday': 'Kemarin',
  'common.saving': 'Menyimpan...',
  'common.day': 'hari',
  'common.days': 'hari',
  'update_banner.msg': 'versi baru tersedia',
  'update_banner.reload': 'muat ulang ›',

  'ob.install.heading': 'Pasang di layar utama biar kayak app beneran',
  'ob.install.ios_label': 'iPhone',
  'ob.install.ios_step1':
    'Tap ikon Bagikan — tombol kotak dengan panah ke atas, di tengah bawah layar',
  'ob.install.ios_step2': 'Scroll ke bawah, pilih "Tambahkan ke Layar Utama"',
  'ob.install.ios_step3': 'Tap Tambah di pojok kanan atas',
  'ob.install.ios_hint': 'Gak ketemu opsinya? Coba buka di Safari ya.',
  'ob.install.android_label': 'Android',
  'ob.install.android_step1': 'Tap ⋮ — tiga titik di pojok kanan atas',
  'ob.install.android_step2': 'Pilih "Tambahkan ke layar utama" atau "Instal aplikasi"',
  'ob.install.android_step3': 'Tap Tambah atau Instal',
  'ob.install.cta': 'Sudah dipasang',
  'ob.install.skip': 'Nanti dulu ›',

  'ob.step2.heading': 'Tempel kode lisensi',
  'ob.step2.sub': 'Kode dikirim ke email lo abis beli.',
  'ob.step2.hint': 'Paste kode dari email lo',
  'ob.step2.verify': 'Memverifikasi…',
  'ob.step2.activate': 'Aktivasi',
  'ob.step2.buy_cta': 'Belum punya kode? Beli di sini ›',
  'ob.step2.err_expired': 'kode sudah expired — perpanjang atau beli baru ›',
  'ob.step2.err_invalid': 'kode ga valid, cek email lo lagi',
  'ob.step2.err_other': 'terjadi kesalahan, coba lagi',

  'ob.step3.heading': 'Data lo, ga kemana-mana.',
  'ob.step3.body1': 'Catat duit, andai skenario, cek sebelum beli.',
  'ob.step3.body2': 'Ga ada akun. Ga ada server. Kami ga tau lo siapa.',
  'ob.step3.next': 'Lanjut',
  'ob.step3.skip': 'Lewati ›',

  'ob.step4a.heading': 'Tipe pemasukan lo',
  'ob.step4a.sub':
    'SISA pakai ini untuk ngitung jatah harian lo dan prediksi saldo saat gajian. Cuma tersimpan di HP lo.',
  'ob.step4a.tetap_label': 'Gaji tetap',
  'ob.step4a.tetap_sub': 'Masuk tanggal yang sama tiap bulan',
  'ob.step4a.freelance_label': 'Freelance / tidak tetap',
  'ob.step4a.freelance_sub': 'Nggak tentu tanggal dan jumlahnya',
  'ob.step4a.mix_label': 'Campuran',
  'ob.step4a.mix_sub': 'Ada gaji, ada juga pemasukan lain',
  'ob.step4a.next': 'Lanjut',

  'ob.step4b.heading_tetap': 'Tanggal gajian',
  'ob.step4b.heading_mix': 'Detail pemasukan',
  'ob.step4b.heading_freelance': 'Batas aman saldo',
  'ob.step4b.sub_tetap':
    'SISA hitung mundur dari tanggal ini — biar jatah harian lo presisi, bukan tebak-tebakan.',
  'ob.step4b.sub_mix':
    'Kalau ada gaji tetap, isi tanggalnya. Pemasukan lain bisa dicatat manual nanti.',
  'ob.step4b.sub_freelance':
    'Karena nggak ada tanggal gajian pasti, SISA pakai ini sebagai patokan aman. Lo yang tentuin angkanya.',
  'ob.step4b.freq_label': 'Frekuensi gajian',
  'ob.step4b.freq_bulanan': 'Bulanan',
  'ob.step4b.freq_mingguan': 'Mingguan',
  'ob.step4b.freq_2mingguan': '2 Mingguan',
  'ob.step4b.anchor_label': 'Tanggal patokan siklus gajian',
  'ob.step4b.anchor_hint': 'Pilih salah satu tanggal gajian kamu — jadwal dihitung dari sini',
  'ob.step4b.payday_label': 'Tanggal gajian',
  'ob.step4b.payday_placeholder': 'Pilih tanggal…',
  'ob.step4b.payday_day': 'Tanggal {d}',
  'ob.step4b.min_balance_optional': 'Minimum saldo aman (opsional)',
  'ob.step4b.min_balance_required': 'Minimum saldo aman',
  'ob.step4b.min_balance_hint': 'SISA akan kasih peringatan kalau saldo lo di bawah angka ini.',
  'ob.step4b.avg_income_label': 'Rata-rata pemasukan',
  'ob.step4b.avg_income_basis_label': 'Per',
  'ob.step4b.avg_income_hint':
    'Estimasi aja — SISA tetap jaga pakai batas saldo aman biar nggak nabrak.',
  'ob.step4b.fixed_income_label_tetap': 'Berapa pemasukan lo per periode?',
  'ob.step4b.fixed_income_label_mix': 'Berapa gaji tetap lo per periode?',
  'ob.step4b.fixed_income_hint': 'Disimpan lokal di device lo aja, bukan ke server.',
  'ob.step4b.next': 'Lanjut',

  'ob.payConfirm.heading': 'Kapan terakhir lo nerima gaji?',
  'ob.payConfirm.sub': 'Dari sini SISA bisa hitung jatah harian yang akurat.',
  'ob.payConfirm.preset_prefix': 'Sekitar',
  'ob.payConfirm.picker_label': 'Pilih tanggal lain',
  'ob.payConfirm.first_label': 'Belum pernah, ini gajian pertama',
  'ob.payConfirm.first_sub': 'SISA pakai saldo sekarang sebagai patokan',
  'ob.payConfirm.next': 'Lanjut',

  'home.transisi_heading': 'Gajian bentar lagi?',
  'home.transisi_sub': 'Konfirmasi saat gaji masuk biar jatah harian periode baru bisa dihitung.',
  'home.transisi_btn': 'Udah gajian',
  'home.transisi_popup_heading': 'Mulai periode baru?',
  'home.transisi_popup_body':
    'Gaji bulan ini dianggap sudah masuk. Jatah harian dihitung ulang dari awal.',
  'home.transisi_popup_date_label': 'Gajian tanggal',
  'home.transisi_popup_nominal_label': 'Nominal gaji',
  'home.transisi_popup_confirm': 'Ya, mulai periode baru',
  'home.transisi_popup_cancel': 'Batal',

  'ob.langCurrency.currency_label': 'Mata Uang Utama',
  'ob.langCurrency.currency_placeholder': 'Pilih mata uang…',
  'ob.langCurrency.explainer':
    'Mata uang utama adalah mata uang yang kamu pakai untuk hampir semua kebutuhan sehari-hari — makan, transport, tagihan, belanja. SISA memakai mata uang ini sebagai dasar semua perhitungan: berapa saldo yang aman kamu pakai, jatah harianmu, sampai sisa uangmu. Pilih mata uang tempat kamu paling banyak hidup dan berbelanja sehari-hari. Kalau punya saldo dalam mata uang lain, nanti tetap bisa ditambahkan per dompet dan otomatis dikonversi ke mata uang utama ini.',

  'ob.step4c.heading': 'Mata Uang Utama',
  'ob.step4c.sub': 'Budget & saldo bebas selalu dihitung dalam mata uang ini.',
  'ob.step4c.placeholder': 'Pilih mata uang…',
  'ob.step4c.next': 'Lanjut',

  'ob.step4d.heading': 'Dompet lo',
  'ob.step4d.sub': 'Tambah rekening, dompet tunai, atau e-wallet. Saldo bisa diisi nanti.',
  'ob.step4d.wallet_label': 'Dompet {n}',
  'ob.step4d.balance_label': 'Saldo sekarang (opsional)',
  'ob.step4d.add_more': '+ Tambah dompet lain',
  'ob.step4d.next': 'Lanjut',
  'ob.step4d.remove_aria': 'Hapus dompet',
  'ob.step4d.placeholder_first': 'Nama dompet (cth: BCA, GoPay)',
  'ob.step4d.placeholder_other': 'Nama dompet',
  'ob.step4d.currency_label': 'Mata uang',

  'currency_picker.search': 'pilih mata uang…',
  'currency_picker.popular': 'Populer',
  'currency_picker.all': 'Semua',
  'currency_picker.empty': 'Mata uang tidak ditemukan',
  'currency_picker.aria': 'Pilih mata uang',

  'budget.title': 'budget hari ini',
  'budget.info_aria': 'Cara hitung budget harian',
  'budget.desc_line': 'jatah harian untuk {days} hari sampai gajian tgl {date}',
  'budget.spent': '{amount} terpakai',
  'budget.left_today': '{amount} sisa hari ini',
  'budget.week_title': 'budget minggu ini',
  'budget.week_days': 'sampai minggu · {days} hari',
  'budget.bills_title': 'tagihan vs uangmu',
  'budget.empty_balance': 'saldo kosong',
  'budget.sheet_title': 'Cara hitung budget',

  'saldo.title': 'sisa bulan ini',
  'saldo.toggle_aria': 'Tap untuk lihat detail dompet',
  'saldo.no_wallets': 'Belum ada dompet',
  'saldo.spent_yesterday': '{amount} terpakai kemarin',
  'saldo.income_yesterday': '{amount} masuk kemarin',
  'saldo.total': 'Total saldo',
  'saldo.tagihan': '− Tagihan bulan ini',
  'saldo.nabung': '− Tabungan',
  'saldo.sisa': '= Sisa bulan ini',
  'saldo.income_month': 'Pemasukan bulan ini',
  'saldo.expense_month': 'Pengeluaran bulan ini',
  'saldo.verdict_near_limit':
    '● Mendekati batas aman lo — pertimbangkan kurangi pengeluaran sekarang.',
  'saldo.verdict_below_limit':
    '● Anggaran lo sudah di bawah batas aman — kurangi pengeluaran segera.',
  'saldo.formula_title': 'Dari mana angka ini?',
  'saldo.formula_intro':
    'Anggaran Operasional bukan cuma saldo di dompet lo. Ada yang udah "dipesan" duluan.',
  'saldo.formula_total_wallets': 'Total saldo semua dompet',
  'saldo.formula_bills_label': 'Tagihan yang belum lunas di periode ini',
  'saldo.formula_bills_sublabel': '(dipesan buat bayar)',
  'saldo.formula_savings_label': 'Dana yang lagi ditabung',
  'saldo.formula_savings_sublabel': '(diendapkan, bukan buat dipakai)',
  'saldo.formula_total_label': 'Anggaran Operasional',
  'saldo.formula_note': 'Ini anggaran yang beneran bisa lo pakai — bukan sekedar sisa di rekening.',
  'saldo.jatah_harian_label': 'Jatah Harian',
  'saldo.jatah_harian_tooltip':
    'Dibagi dari sisa awal periode — ini yang boleh lo pakai per hari. Fixed, bukan berubah tiap hari.',
  'saldo.anggaran_tooltip':
    'Pemasukan periode dikurangi tagihan belum bayar dan target nabung. Ini uang yang "bebas" untuk operasional harian.',
  'saldo.expand_btn': 'kok bisa segini?',
  'saldo.collapse_btn': 'sembunyikan',
  'saldo.rincian_tagihan': '− Tagihan belum dibayar',
  'saldo.rincian_nabung': '− Udah ditabung',
  'saldo.rincian_anggaran': '= Sisa sekarang',
  'saldo.rincian_hari_periode': '+ {n} hari periode',
  'saldo.rincian_jatah': '= Jatah Harian',
  'saldo.rincian_udah_jalan': 'Udah jalan {x} hari → sisa {amount}',
  'saldo.total_saldo_label': 'total semua wallet',
  'saldo.uang_mengendap_label': 'Uang Mengendap',
  'saldo.uang_mengendap_sub': 'di luar periode ini',
  'saldo.rincian_udah_kepakai': '− Udah kepakai',
  'saldo.sisa_periode_label': 'Sisa periode ini',
  'saldo.uang_mengendap_tooltip':
    'Saldo nganggur yang sebaiknya jangan dipakai buat operasional. Aman, tetap punya lo.',
  'saldo.mode_bertahan_badge': 'MODE BERTAHAN',
  'saldo.mode_bertahan_msg':
    'Uangmu sudah ter-booking habis sampai gajian — ini yang harus lo tutup:',
  'saldo.mode_bertahan_shortfall_label': 'KEKURANGAN',
  'saldo.mode_bertahan_aman_mulai': 'Aman mulai',
  'saldo.mode_bertahan_note': 'Tagihan + target nabung melebihi pemasukan periode ini.',
  'saldo.mode_harigajian_badge': 'Hari Gajian',
  'saldo.mode_harigajian_heading': 'Gaji udah masuk?',
  'saldo.mode_harigajian_sub':
    'Konfirmasi dulu biar jatah harian lo bisa dihitung untuk periode baru.',
  'saldo.mode_harigajian_yes': 'Sudah, konfirmasi',
  'saldo.mode_harigajian_no': 'Belum',
  'saldo.mode_harigajian_ringkasan': 'RINGKASAN PERIODE LALU',
  'saldo.mode_harigajian_sisa_anggaran': 'Sisa anggaran',
  'saldo.mode_harigajian_total_saldo': 'Total Saldo',
  'saldo.mode_harigajian_uang_mengendap': 'Uang Mengendap',
  'saldo.mode_hariterakhir_badge': 'Hari terakhir',
  'saldo.mode_hariterakhir_sub_label': 'Sisa hari ini',
  'saldo.mode_hariterakhir_note':
    'Ini hari terakhir periode. Besok periode baru dimulai dan jatah harian dihitung ulang.',

  'tagihan_module.title': 'tagihan bulan ini',
  'tagihan_module.empty_text':
    'Catat tagihan rutin — listrik, internet, streaming — biar budget lo akurat dan gak kecolongan.',
  'tagihan_module.more': '{n} tagihan lainnya',
  'tagihan_module.swipe_hint': 'geser kiri untuk tandai dibayar',
  'tagihan_module.add': '+ Tambah tagihan',
  'tagihan_module.chip_unpaid': 'Belum dibayar',
  'tagihan_module.chip_paid': 'Lunas',
  'tagihan_module.unpaid_label': 'Total tagihan belum dibayar',
  'tagihan_module.pill_unpaid': 'belum dibayar',
  'tagihan_module.pill_paid': 'lunas',
  'tagihan_module.idr_lunas': 'IDR · lunas',
  'tagihan_module.all_paid': 'Semua lunas',
  'tagihan_module.all_paid_sub': '{n} tagihan · bulan ini',
  'tagihan_module.ctx_total': 'Total {total}',
  'tagihan_module.ctx_paid': 'Sudah {paid}',

  'notif.both': '{n} komitmen lewat tempo & jatuh tempo hari ini',
  'notif.overdue': '{n} komitmen lewat tempo',
  'notif.due_today': '{n} komitmen jatuh tempo hari ini',
  'notif.extra': '+{n} lainnya',

  'backup.title_urgent': 'Sudah lama gak backup!',
  'backup.title_normal': 'Backup data lo',
  'backup.desc': 'Data SISA tersimpan di HP ini. Kalau ganti HP tanpa backup, data hilang.',
  'backup.guide_btn': 'Cara backup ›',
  'backup.guide_title': 'Cara backup data SISA',
  'backup.guide_got_it': 'Oke, ngerti',

  'footer.last_recorded': 'terakhir dicatat:',
  'footer.minutes_ago': '{n} menit lalu',
  'footer.hours_ago': '{n} jam lalu',
  'footer.days_ago': '{n} hari lalu',
  'footer.no_records': 'belum ada catatan',
  'footer.all_records': 'semua catatan ›',
  'footer.tx_fallback': 'Transaksi',

  'actions.log_aria': 'Catat transaksi',
  'actions.log_label': 'Catat',
  'actions.cek_aria': 'Cek Dulu — aman ga gue beli ini?',
  'actions.cek_label': 'Cek Dulu',
  'actions.cek_sub': 'aman ga gue beli ini?',
  'actions.andai_aria': 'Andai',
  'actions.andai_label': 'Andai',
  'actions.log_full_label': 'Catat pengeluaran / pemasukan',

  'decision.heading_line1': 'Aman beli',
  'decision.heading_line2': 'sekarang?',
  'decision.input_placeholder': 'Berapa harganya?',
  'decision.cek_btn': 'Cek sekarang',
  'decision.andai_prefix': 'atau',
  'decision.andai_link': 'simulasi dengan Andai →',

  'cek.empty.heading': 'Yuk, kenali kondisi keuanganmu',
  'cek.empty.body':
    'Isi data tagihan dan wallet dulu — nanti card ini bisa nunjukin kondisi keuanganmu dan simulasi andai-andai.',
  'cek.empty.cta': 'Tambah tagihan pertama',
  'cek.badge_estimasi': 'ESTIMASI',
  'cek.badge_akurat': 'AKURAT',
  'cek.section_label': 'KELENGKAPAN DATA',
  'cek.item_tagihan': 'Tagihan',
  'cek.item_wallet': 'Wallet',
  'cek.item_tabungan': 'Tabungan',
  'cek.done_tagihan': '{n} tagihan ditambahkan',
  'cek.need_fill': 'Perlu diisi',
  'cek.optional': 'opsional',
  'cek.disclaimer': 'Estimasi belum akurat — lengkapi data {item}',
  'cek.row_sisa': 'Sisa gaji estimasi',
  'cek.row_tagihan': 'Tagihan tetap',
  'cek.andai_warning': 'Aktif setelah {item} diisi',
  'cek.cta_add': 'Tambah {item} sekarang',
  'cek.nabung_cta': 'Catat tabungan',

  'history.title': 'Riwayat',
  'history.filter_all': 'Semua',
  'history.filter_keluar': 'Keluar',
  'history.filter_masuk': 'Masuk',
  'history.filter_nabung': 'Nabung',
  'history.empty': 'Belum ada catatan',
  'history.type_keluar': 'Pengeluaran',
  'history.type_masuk': 'Pemasukan',
  'history.type_nabung': 'Nabung',
  'history.type_tagihan': 'Tagihan',
  'history.type_transfer': 'Transfer',
  'history.today': 'Hari ini',
  'history.yesterday': 'Kemarin',
  'history.edit_aria': 'Edit',
  'history.delete_aria': 'Hapus',

  'mark_paid.title': 'Bayar {name}',
  'mark_paid.nominal': 'Nominal',
  'mark_paid.from': 'Bayar dari',
  'mark_paid.date_label': 'Tanggal',
  'mark_paid.estimate': 'estimasi: {amount}',
  'mark_paid.insufficient': 'Saldo {wallet} tidak cukup untuk pembayaran ini.',
  'mark_paid.submit': 'Tandai Dibayar',

  'tagihan_detail.due_date_label': 'Jatuh tempo',
  'tagihan_detail.nominal': 'Nominal',
  'tagihan_detail.due_day': 'Tgl {day}',
  'tagihan_detail.status': 'Status',
  'tagihan_detail.last_paid': 'Terakhir dibayar',
  'tagihan_detail.status_paid': 'Sudah dibayar bulan ini',
  'tagihan_detail.status_overdue': 'Lewat tempo',
  'tagihan_detail.status_due_today': 'Jatuh tempo hari ini',
  'tagihan_detail.status_unpaid': 'Belum dibayar',
  'tagihan_detail.mark_paid': 'Tandai Dibayar',
  'tagihan_detail.delete_confirm': 'Yakin hapus {name}?',
  'tagihan_detail.urgent_title': 'Komitmen mendesak',
  'tagihan_detail.overdue_days': 'Lewat tempo {n} hari',
  'tagihan_detail.due_today': 'Jatuh tempo hari ini',
  'tagihan_detail.pay_btn': 'Bayar',

  'tagihan_swipe.mark_paid_aria': 'Tandai dibayar',
  'tagihan_swipe.mark_paid_label': 'tandai dibayar',
  'tagihan_swipe.paid_badge': 'lunas',

  'toast.edit': 'Ubah',
  'toast.undo': 'Batal',

  'home.toast_paid': '{name} ditandai dibayar',
  'home.toast_masuk': 'Pemasukan dicatat',
  'home.toast_keluar': 'Pengeluaran dicatat',
  'home.days_to_payday': '{n} hari ke gajian',
  'home.day_to_payday': '{n} hari ke gajian',
  'home.saldo_bebas': 'Sisa',
  'home.monthly_title': 'Bulan Ini',
  'home.income_label': 'Pemasukan',
  'home.expense_label': 'Pengeluaran',
  'home.savings_label': 'Tabungan',
  'home.payday_confirm_title': 'Gaji udah masuk?',
  'home.payday_confirm_sub': 'Kalau udah, SISA reset jatah harian dari sekarang.',
  'home.payday_confirm_yes': 'Udah masuk',
  'home.payday_confirm_no': 'Belum',

  'equiv.approx': '≈ {equiv} · kurs {date}',

  'wallets.total_label': 'total kekayaan',
  'wallets.total_label_fallback': 'total kekayaan ({currency})',
  'wallets.fallback_note': '{currencies} tidak termasuk · kurs belum tersedia',
  'wallets.rate_unavailable': 'kurs belum tersedia',
  'wallets.collapse': 'Sembunyikan',

  'push.ask_title': 'Ingatkan saat jatuh tempo?',
  'push.ask_body':
    'Kami kirim notifikasi pas tagihan jatuh tempo dan sehari setelahnya — biar nggak kelewat.',
  'push.ask_cta': 'Ya, ingatkan',
  'push.ask_later': 'Nanti aja',

  'quick_log.mode_keluar': 'keluar',
  'quick_log.mode_masuk': 'masuk',
  'quick_log.date_label': 'Pilih tanggal',
  'quick_log.date_custom_aria': 'Pilih tanggal lain',
  'quick_log.submitting': 'Menyimpan...',
  'quick_log.submit_edit': 'Simpan',
  'quick_log.submit_new': 'Catat',
  'quick_log.label_placeholder': 'kopi, grab, beli baju...',
  'category.manage_btn': 'Atur',
  'settings.row_categories': 'Kategori',
  'settings.row_categories_sub': 'Atur kategori pengeluaran & pemasukan',

  'cek_dulu.title': 'Cek Dulu',
  'cek_dulu.sub': 'aman ga gue beli ini?',
  'cek_dulu.close_aria': 'Tutup',
  'cek_dulu.price_label': 'harga barang',
  'cek_dulu.context_line': '{days} hari lagi menuju gajian',
  'cek_dulu.col_now': 'sekarang',
  'cek_dulu.col_after': 'kalau beli',
  'cek_dulu.daily_label': 'jatah harian sampai gajian',
  'cek_dulu.daily_unit': '/hari',
  'cek_dulu.sisa_label': 'anggaran operasional',
  'cek_dulu.new_flag': 'baru muncul',
  'cek_dulu.mengendap_label': 'uang mengendap kepotong',
  'cek_dulu.mengendap_note': 'Buat nutupin, {amount} ketarik dari Uang Mengendap.',
  'cek_dulu.src_label': 'dihitung dari anggaran operasional',
  'cek_dulu.src_wallets': '{n} dompet · {amount}',
  'cek_dulu.close_btn': 'Tutup',
  'cek_dulu.buy_label': 'Jadi beli — catat keluar',
  'cek_dulu.buy_sub': 'masuk ke history sebagai pengeluaran',
  'cek_dulu.insight_days':
    'Harga ini setara {n} hari jatah harian lo — bayangkan sejumlah hari itu sudah "dipesan" duluan oleh pembelian ini.',
  'cek_dulu.insight_portion':
    'Pembelian ini memakan {pct}% dari sisa uang lo sekarang. Semakin besar persennya, semakin sempit ruang gerak untuk kebutuhan lain bulan ini.',
  'cek_dulu.insight_recovery':
    'Pembelian ini nyentuh tabungan lo. Butuh sekitar {n} hari nabung konsisten buat balik ke posisi sekarang — pastiin ini worth it dulu.',

  'andai.title': 'Andai',
  'andai.sub': 'skenario hipotetis',
  'andai.back_aria': 'Kembali',
  'andai.baseline_label': 'sekarang · tanpa diandai',
  'andai.baseline_saldo': 'anggaran operasional',
  'andai.stack_label': 'andai...',
  'andai.remove_aria': 'Hapus',
  'andai.kind_beli': 'pengeluaran',
  'andai.kind_income': 'pemasukan',
  'andai.kind_tagihan': 'tagihan',
  'andai.result_label': 'kalau semua ini kejadian',
  'andai.result_daily': 'jatah harian\nsampai gajian',
  'andai.result_sisa': 'sisa uang',
  'andai.reset': 'Reset',
  'andai.save': 'Simpan',
  'andai.compare': 'Banding',
  'andai.compare_bar': 'Bandingkan 2 skenario ini',
  'andai.add_event': '+ tambah kejadian',
  'andai.add_desc_label': 'Deskripsi (opsional)',
  'andai.add_nominal_label': 'Nominal',
  'andai.add_submit': 'Tambah',
  'andai.placeholder_beli': 'e.g. service mobil',
  'andai.placeholder_income': 'e.g. gaji, freelance',
  'andai.placeholder_tagihan': 'e.g. langganan baru',
  'andai.scenarios_label': 'skenario tersimpan',
  'andai.scenarios_delete_aria': 'Hapus skenario',
  'andai.scenarios_delete_label': 'hapus',
  'andai.save_sheet_title': 'Simpan skenario',
  'andai.save_sheet_label': 'Nama skenario',
  'andai.save_sheet_placeholder': 'e.g. beli motor + freelance',
  'andai.save_sheet_submit': 'Simpan',
  'andai.compare_sheet_title': 'Banding skenario',
  'andai.compare_daily': 'jatah harian',
  'andai.compare_sisa': 'anggaran operasional',
  'andai.baseline_mengendap': 'uang mengendap',
  'andai.income_disclaimer':
    '* Pemasukan di Andai diasumsikan langsung tersedia, bukan prediksi tanggal.',
  'andai.insight_days':
    'Skenario ini menggerus {n} hari jatah harian lo — kalau semua ini kejadian, sejumlah hari itu sudah habis sebelum dimulai.',
  'andai.insight_portion':
    'Efek bersih skenario ini mengambil {pct}% dari total sisa lo sampai gajian. Semakin besar angkanya, semakin sempit ruang gerak untuk kebutuhan lain.',
  'andai.insight_recovery':
    'Skenario ini mengurangi tabungan lo. Butuh sekitar {n} hari nabung konsisten untuk balik ke posisi sekarang — timbang lagi apakah worth it.',

  'profil.wallets_title_list': 'Dompet',
  'profil.wallets_title_add': 'Tambah dompet',
  'profil.wallets_name_label': 'nama dompet',
  'profil.wallets_balance_label': 'saldo aktual sekarang',
  'profil.wallets_sesuaikan_btn': 'Sesuaikan saldo',
  'profil.wallets_delete_btn': 'Hapus dompet',
  'profil.wallets_delete_confirm': 'Yakin hapus {name}?',
  'profil.wallets_diff_prefix': 'selisih',
  'profil.wallets_diff_from': 'selisih dari mana?',
  'profil.wallets_opt_lupa': 'Lupa catat aja',
  'profil.wallets_opt_transfer': 'Transfer ke dompet lain',
  'profil.wallets_transfer_pick_label': 'pilih dompet tujuan',
  'profil.wallets_transfer_confirm': 'Konfirmasi transfer',
  'profil.wallets_initial_balance': 'saldo awal',
  'profil.wallets_add_btn': 'Tambah dompet',
  'profil.wallets_add_placeholder': 'e.g. BCA, Dana, Tunai',
  'profil.wallets_add_more': '+ Tambah dompet',
  'profil.wallets_currency_label': 'Mata uang',

  'profil.income_title': 'Profil keuangan',
  'profil.income_type_label': 'tipe pemasukan',
  'profil.income_type_tetap': 'tetap',
  'profil.income_type_freelance': 'freelance',
  'profil.income_type_mix': 'campuran',
  'profil.income_day_label': 'tanggal gajian (1–31)',
  'profil.income_weekend_label': 'kalau jatuh di weekend',
  'profil.income_weekend_maju': 'Maju ke Jumat',
  'profil.income_weekend_mundur': 'Mundur ke Senin',
  'profil.income_weekend_tetap': 'Tetap di hari itu',
  'profil.income_freelance_note':
    'Freelance: sisa = saldo minimum akhir bulan. Payday = hari terakhir bulan.',
  'profil.income_save': 'Simpan',

  'profil.license_title': 'Lisensi',
  'profil.license_status_label': 'status',
  'profil.license_active': 'aktif',
  'profil.license_expires_label': 'masa aktif',
  'profil.license_days_left': '{n} hari lagi · s/d {date}',
  'profil.license_not_active': 'Lisensi belum diaktifkan.',
  'profil.license_change': 'Ganti kode lisensi',
  'profil.license_enter': 'Masukkan kode lisensi',
  'profil.license_verifying': 'Memverifikasi…',
  'profil.license_activate': 'Aktifkan',
  'profil.license_buy_label': 'perpanjang / beli baru',
  'profil.license_err_invalid': 'Kode tidak valid atau tanda tangan tidak cocok.',
  'profil.license_err_expired': 'Kode sudah kadaluarsa.',
  'profil.license_success': 'Lisensi berhasil diaktifkan!',

  'profil.tagihan_currency_label': 'Mata uang',
  'profil.tagihan_title_list': 'Tagihan',
  'profil.tagihan_title_edit': 'Edit tagihan',
  'profil.tagihan_title_add': 'Tambah tagihan',
  'profil.tagihan_empty': 'Belum ada tagihan.',
  'profil.tagihan_name_label': 'nama tagihan',
  'profil.tagihan_name_placeholder': 'e.g. Spotify, BPJS',
  'profil.tagihan_nominal_label': 'nominal',
  'profil.tagihan_fixed': 'selalu sama',
  'profil.tagihan_variable': 'bisa berubah',
  'profil.tagihan_due_label': 'tanggal jatuh tempo (1–31)',
  'profil.tagihan_freq_label': 'frekuensi',
  'profil.tagihan_rutin': 'rutin',
  'profil.tagihan_sekali': 'sekali',
  'profil.tagihan_freq_sekali': 'Sekali',
  'profil.tagihan_freq_mingguan': 'Mingguan',
  'profil.tagihan_freq_2mingguan': '2 Mingguan',
  'profil.tagihan_freq_bulanan': 'Bulanan',
  'profil.tagihan_freq_2bulanan': '2 Bulanan',
  'profil.tagihan_freq_3bulanan': '3 Bulanan',
  'profil.tagihan_freq_tahunan': 'Tahunan',
  'profil.tagihan_date_label': 'Tanggal',
  'profil.tagihan_weekday_label': 'Hari',
  'profil.tagihan_anchor_month_label': 'Bulan mulai',
  'profil.tagihan_annual_month_label': 'Bulan',
  'profil.tagihan_add_btn': '+ Tambah tagihan',

  'settings.title': 'setelan',
  'settings.back_aria': 'Kembali',
  'settings.profile_active_until': 'Aktif sampai {date} · {n} hari lagi',
  'settings.profile_not_active': 'Belum aktif',
  'settings.section_profil': 'profil',
  'settings.row_income': 'pemasukan',
  'settings.row_income_sub': 'jenis & tanggal gajian',
  'settings.section_tampilan': 'tampilan',
  'settings.row_theme': 'tema',
  'settings.theme_light': 'terang',
  'settings.theme_dark': 'gelap',
  'settings.theme_system': 'sistem',
  'settings.dark_note': 'gelap = v2 · belum tersedia',
  'settings.row_language': 'bahasa',
  'settings.row_patokan_currency': 'Mata Uang Utama',
  'settings.row_patokan_currency_sub': 'Dipakai untuk hampir semua biaya hidupmu',
  'settings.currency_warning_title': 'Ganti mata uang utama',
  'settings.currency_warning_body':
    'Mengubah mata uang utama tidak mengubah angka yang sudah tersimpan. Rp 50.000 akan menjadi $50.000, bukan dikonversi.',
  'settings.section_data': 'data & backup',
  'settings.export_json': 'export backup',
  'settings.export_json_sub': 'file lengkap buat pindah / restore',
  'settings.export_csv': 'export transaksi',
  'settings.export_csv_sub': 'buat dibuka di spreadsheet',
  'settings.import': 'import dari backup',
  'settings.import_sub': 'restore dari file .json',
  'settings.delete': 'hapus semua data',
  'settings.delete_sub': 'tidak bisa di-undo',
  'settings.section_about': 'tentang',
  'settings.made_by': 'dibuat oleh',
  'settings.contact': 'twitter',
  'settings.email': 'email',
  'settings.import_preview_title': 'Import backup',
  'settings.import_preview_wallets': 'dompet',
  'settings.import_preview_txs': 'transaksi',
  'settings.import_preview_bills': 'tagihan',
  'settings.import_preview_goals': 'goal',
  'settings.import_warning': 'Data yang ada sekarang akan ditimpa. Tidak bisa di-undo.',
  'settings.import_confirm': 'Restore sekarang',
  'settings.import_error_title': 'Gagal import',
  'settings.delete_title': 'Hapus semua data',
  'settings.delete_warning':
    'Semua transaksi, wallet, tagihan, dan goal akan dihapus permanen. Lisensi tetap tersimpan.',
  'settings.delete_next': 'Lanjut hapus',
  'settings.delete_type_prompt': 'Ketik HAPUS untuk konfirmasi',
  'settings.delete_type_word': 'HAPUS',
  'settings.delete_type_placeholder': 'HAPUS',
  'settings.delete_confirm_btn': 'Hapus semua data',

  'alokasi.buat_dipakai': 'Uang operasional sehari-hari',
  'alokasi.uang_mengendap': 'Uang Mengendap',
  'alokasi.mengendap_note': 'Uang Mengendap boleh Rp 0.',
  'alokasi.jatah_harian_approx': 'Jatah harian ≈',
  'alokasi.sampai_gajian': 'sampai gajian berikutnya',
  'alokasi.sampai_akhir_bulan': 'sampai akhir bulan',
  'alokasi.atur_ulang_title': 'Atur ulang alokasi',
  'alokasi.bisa_kamu_atur': 'Nominal yang bisa kamu atur',
  'alokasi.ubah_dipakai': 'Atur alokasi uangmu',
  'alokasi.mengendap_auto': 'OTOMATIS',

  'home.sisa_uang': 'SISA UANGMU',
  'home.sisa_uang_tooltip':
    'Ini uang yang aman kamu pakai sampai gajian berikutnya.\n\nHitungannya:\nTotal saldo semua wallet\n− Tagihan yang belum dibayar\n− Uang Mengendap (yang sengaja kamu diamkan, bukan buat dipakai)\n= Sisa uangmu\n\nJatah harian dihitung dari angka ini dibagi sisa hari sampai gajian.',
  'home.insight_teaser_ratio': 'Bulan ini lo pakai {pct}% dari pemasukan',
  'home.insight_teaser_clean': 'Belum ada pengeluaran bulan ini. Awal yang bersih',
  'home.insight_teaser_spend_only': 'Bulan ini lo udah keluar {jumlah}',
  'home.insight_teaser_generic': 'Catatan pertamamu bakal muncul jadi insight di sini',
  'home.insight_card_label': 'INSIGHT',
  'home.insight_card_cta': 'Lihat Insight →',
  'home.expand_show': 'kok bisa segini?',
  'home.expand_hide': 'sembunyikan',
  'home.duit_di_mana': 'Duit lo ada di mana',
  'home.bulan_ini': 'Bulan ini',
  'home.lihat_riwayat': 'lihat riwayat →',
  'home.dompet': 'Dompet',
  'home.tambah_dompet': '+ Tambah dompet',
  'home.wallets_empty_title': 'Belum ada dompet',
  'home.wallets_empty_sub': 'tambah dompet pertama lo untuk mulai lacak saldo',
  'home.wallets_more': '+ {n} dompet lainnya',
  'home.atur_alokasi': 'atur',
  'home.banner_gajian_title': 'Gajian masuk?',
  'home.banner_gajian_body': 'Gajian masuk? Atur ulang alokasi lo.',
  'home.banner_periode_title': 'Periode habis',
  'home.banner_periode_body': 'Periode lo udah lewat — atur ulang alokasi.',
  'home.banner_cta': 'Atur alokasi →',
  'home.jatah_harian_label': 'Jatah Harian',
  'home.jatah_keluar': 'Keluar hari ini',
  'home.jatah_lewat_badge': '⚠ Lewat',
  'home.jatah_lewat_title': 'Hari ini lewat {n}',
  'home.jatah_besok': 'Besok jatahmu nyusut jadi {n}',

  // insight
  'insight.back_aria': 'Kembali',
  'insight.hero_hemat': 'Bulan ini lo lebih hemat {pct}% dari {month}.',
  'insight.hero_hemat_sub': 'pengeluaran turun {amount} dari bulan lalu',
  'insight.hero_boros': 'Bulan ini lo lebih boros {pct}% dari {month}.',
  'insight.hero_boros_sub': 'pengeluaran naik {amount} dari bulan lalu',
  'insight.hero_ratio': 'Bulan ini lo pakai {pct}% dari pemasukan.',
  'insight.hero_ratio_sub': 'sisa {amount} dari total {income}',
  'insight.hero_neutral_calm': 'Bulan yang kalem.',
  'insight.hero_neutral_fresh': 'Awal yang bersih.',
  'insight.hero_neutral_sub': 'Mulai catat buat lihat insight',
  'insight.card_monthly': 'Uang Bulanan',
  'insight.metric_net': 'Net',
  'insight.metric_keluar': 'Keluar',
  'insight.metric_masuk': 'Masuk',
  'insight.monthly_label_expense': 'Pengeluaran',
  'insight.monthly_label_income': 'Pemasukan',
  'insight.monthly_delta_less': '↓ pengeluaran {pct}% vs {month}',
  'insight.monthly_delta_more': '↑ pengeluaran {pct}% vs {month}',
  'insight.monthly_delta_income_up': '↑ pemasukan {pct}% vs {month}',
  'insight.monthly_delta_income_down': '↓ pemasukan {pct}% vs {month}',
  'insight.monthly_delta_net_up': '↑ net membaik {amount} vs {month}',
  'insight.monthly_delta_net_down': '↓ net memburuk {amount} vs {month}',
  'insight.monthly_empty': 'Datanya masih ngumpul,\nbalik lagi nanti ya.',
  'insight.monthly_empty_sub': 'butuh minimal 2 minggu data',
  'insight.card_category': 'Kategori Bulanan',
  'insight.cat_empty': 'Belum ada transaksi\nberkategori bulan ini.',
  'insight.cat_empty_sub': 'catatan pertama = data pertama insight',
  'insight.cat_delta_up': '↑ naik {pct}% dari {month}',
  'insight.cat_delta_down': '↓ turun {pct}% dari {month}',
  'insight.cat_no_prev': 'baru bulan ini',
  'insight.cat_pct_of_total': '{pct}% dari pengeluaran bulan ini',
  'insight.card_spend_pct': 'Persen Pengeluaran Bulanan',
  'insight.spend_pct_from': 'dari pemasukan bulan ini',
  'insight.spend_pct_used': 'dipakai · {amount}',
  'insight.spend_pct_left': 'sisa · {amount}',
  'insight.spend_pct_empty': 'Tambahkan pemasukan dulu\nbiar rasionya bisa dihitung.',
  'insight.spend_pct_empty_sub': 'atur pemasukan di pengaturan profil',
  'insight.card_daily': 'Ritme Harian',
  'insight.daily_empty': 'Belum ada pengeluaran\nbulan ini.',
  'insight.daily_empty_sub': 'mulai mencatat — pola kamu bakal muncul di sini',
  'insight.daily_legend_low': 'sedikit',
  'insight.daily_legend_high': 'banyak',
  'insight.daily_sheet_empty': 'Tidak ada transaksi hari ini.',
  'insight.daily_sheet_total': 'Total',
  'insight.card_ranking': 'Klasemen Kategori',
  'insight.ranking_vs': 'dibanding {month}',
  'insight.ranking_empty': 'Belum ada kategori\nyang dicatat bulan ini.',
  'insight.ranking_empty_sub': 'kasih kategori ke tiap transaksi ya',
  'insight.card_top_tx': '5 Transaksi Besar',
  'insight.top_tx_empty': 'Belum ada transaksi\nbulan ini.',
  'insight.top_tx_empty_sub': 'transaksi pertama kamu bakal muncul di sini',
  'insight.fx_skip': 'beberapa transaksi mata uang lain belum terhitung',
  'insight.nav_aria': 'Lihat insight',
}

const en: StringDictionary = {
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.back_aria': 'Back',
  'common.ok': 'OK',
  'common.confirm': 'Confirm',
  'common.add': 'Add',
  'common.today': 'Today',
  'common.yesterday': 'Yesterday',
  'common.saving': 'Saving...',
  'common.day': 'day',
  'common.days': 'days',
  'update_banner.msg': 'new version available',
  'update_banner.reload': 'reload ›',

  'ob.install.heading': 'Add to home screen for the full app experience',
  'ob.install.ios_label': 'iPhone',
  'ob.install.ios_step1': 'Tap the Share icon — the box with an arrow at the bottom of your screen',
  'ob.install.ios_step2': 'Scroll down and tap "Add to Home Screen"',
  'ob.install.ios_step3': 'Tap Add in the top right corner',
  'ob.install.ios_hint': "Can't find it? Try opening this page in Safari.",
  'ob.install.android_label': 'Android',
  'ob.install.android_step1': 'Tap ⋮ — three dots in the top right corner',
  'ob.install.android_step2': 'Select "Add to home screen" or "Install app"',
  'ob.install.android_step3': 'Tap Add or Install',
  'ob.install.cta': "Done, it's added",
  'ob.install.skip': 'Skip for now ›',

  'ob.step2.heading': 'Paste your license key',
  'ob.step2.sub': 'Your key was emailed right after purchase.',
  'ob.step2.hint': 'Paste your key from the email',
  'ob.step2.verify': 'Verifying…',
  'ob.step2.activate': 'Activate',
  'ob.step2.buy_cta': "Don't have a key? Buy here ›",
  'ob.step2.err_expired': 'key expired — renew or buy a new one ›',
  'ob.step2.err_invalid': 'invalid key — double-check your email',
  'ob.step2.err_other': 'something went wrong, try again',

  'ob.step3.heading': 'Your data goes nowhere.',
  'ob.step3.body1': 'Log expenses, run what-ifs, check before you buy.',
  'ob.step3.body2': 'No account. No server. We have no idea who you are.',
  'ob.step3.next': 'Next',
  'ob.step3.skip': 'Skip ›',

  'ob.step4a.heading': 'Your income type',
  'ob.step4a.sub':
    'SISA uses this to calculate your daily budget and predict your balance at payday. Stays on your device.',
  'ob.step4a.tetap_label': 'Fixed salary',
  'ob.step4a.tetap_sub': 'Same date every month',
  'ob.step4a.freelance_label': 'Freelance / irregular',
  'ob.step4a.freelance_sub': 'Unpredictable timing and amount',
  'ob.step4a.mix_label': 'Mixed',
  'ob.step4a.mix_sub': 'Salary plus extra income',
  'ob.step4a.next': 'Next',

  'ob.step4b.heading_tetap': 'Payday date',
  'ob.step4b.heading_mix': 'Income details',
  'ob.step4b.heading_freelance': 'Safe balance floor',
  'ob.step4b.sub_tetap':
    'SISA counts down from this date — so your daily budget is exact, not a guess.',
  'ob.step4b.sub_mix':
    'If you have a fixed payday, set it here. Other income can be logged manually later.',
  'ob.step4b.sub_freelance':
    "Since there's no fixed payday, SISA uses this as your safety floor. You set the number.",
  'ob.step4b.freq_label': 'Pay frequency',
  'ob.step4b.freq_bulanan': 'Monthly',
  'ob.step4b.freq_mingguan': 'Weekly',
  'ob.step4b.freq_2mingguan': 'Biweekly',
  'ob.step4b.anchor_label': 'Reference payday date',
  'ob.step4b.anchor_hint': 'Pick any of your payday dates — the cycle is calculated from this',
  'ob.step4b.payday_label': 'Payday',
  'ob.step4b.payday_placeholder': 'Choose a date…',
  'ob.step4b.payday_day': 'Day {d}',
  'ob.step4b.min_balance_optional': 'Safe balance floor (optional)',
  'ob.step4b.min_balance_required': 'Safe balance floor',
  'ob.step4b.min_balance_hint': 'SISA will warn you when your balance drops below this.',
  'ob.step4b.avg_income_label': 'Average income',
  'ob.step4b.avg_income_basis_label': 'Per',
  'ob.step4b.avg_income_hint': 'Estimate is fine — SISA still guards with your safe balance floor.',
  'ob.step4b.fixed_income_label_tetap': 'How much do you earn per period?',
  'ob.step4b.fixed_income_label_mix': 'How much is your fixed salary per period?',
  'ob.step4b.fixed_income_hint': 'Saved locally on your device only.',
  'ob.step4b.next': 'Next',

  'ob.payConfirm.heading': 'When did you last get paid?',
  'ob.payConfirm.sub': 'This helps SISA calculate your daily budget accurately.',
  'ob.payConfirm.preset_prefix': 'Around',
  'ob.payConfirm.picker_label': 'Choose a different date',
  'ob.payConfirm.first_label': 'Never — this is my first payday',
  'ob.payConfirm.first_sub': 'SISA uses your current balance as the baseline',
  'ob.payConfirm.next': 'Next',

  'home.transisi_heading': 'Payday coming up?',
  'home.transisi_sub': 'Confirm when your salary arrives so your new daily budget is accurate.',
  'home.transisi_btn': 'Salary received',
  'home.transisi_popup_heading': 'Start new period?',
  'home.transisi_popup_body':
    'Your salary is marked as received. Daily budget resets from the beginning.',
  'home.transisi_popup_date_label': 'Payday date',
  'home.transisi_popup_nominal_label': 'Salary amount',
  'home.transisi_popup_confirm': 'Yes, start new period',
  'home.transisi_popup_cancel': 'Cancel',

  'ob.langCurrency.currency_label': 'Main Currency',
  'ob.langCurrency.currency_placeholder': 'Choose currency…',
  'ob.langCurrency.explainer':
    "Your main currency is the one you use for nearly all your day-to-day needs — food, transport, bills, shopping. SISA uses this currency as the basis for every calculation: how much money is safe to spend, your daily allowance, and your remaining balance. Pick the currency you mostly live and spend in. If you hold balances in other currencies, you can still add them per wallet later and they'll be converted into this main currency automatically.",

  'ob.step4c.heading': 'Main Currency',
  'ob.step4c.sub': 'Your daily budget and free balance are always calculated in this currency.',
  'ob.step4c.placeholder': 'Choose currency…',
  'ob.step4c.next': 'Next',

  'ob.step4d.heading': 'Your wallets',
  'ob.step4d.sub': 'Add your bank accounts, cash, or e-wallets. You can fill in balances later.',
  'ob.step4d.wallet_label': 'Wallet {n}',
  'ob.step4d.balance_label': 'Current balance (optional)',
  'ob.step4d.add_more': '+ Add another wallet',
  'ob.step4d.next': 'Next',
  'ob.step4d.remove_aria': 'Remove wallet',
  'ob.step4d.placeholder_first': 'Wallet name (e.g. Standard Chartered, Wise)',
  'ob.step4d.placeholder_other': 'Wallet name',
  'ob.step4d.currency_label': 'Currency',

  'currency_picker.search': 'search currency…',
  'currency_picker.popular': 'Popular',
  'currency_picker.all': 'All',
  'currency_picker.empty': 'Currency not found',
  'currency_picker.aria': 'Choose currency',

  'budget.title': "today's budget",
  'budget.info_aria': 'How daily budget is calculated',
  'budget.desc_line': 'daily budget for {days} days until payday on the {date}th',
  'budget.spent': '{amount} spent',
  'budget.left_today': '{amount} left today',
  'budget.week_title': "this week's budget",
  'budget.week_days': 'until weekend · {days} days',
  'budget.bills_title': 'bills vs your money',
  'budget.empty_balance': 'empty balance',
  'budget.sheet_title': 'How budget is calculated',

  'saldo.title': 'left this month',
  'saldo.toggle_aria': 'Tap to see wallet details',
  'saldo.no_wallets': 'No wallets yet',
  'saldo.spent_yesterday': '{amount} spent yesterday',
  'saldo.income_yesterday': '{amount} received yesterday',
  'saldo.total': 'Total balance',
  'saldo.tagihan': '− Bills this month',
  'saldo.nabung': '− Savings',
  'saldo.sisa': '= Left this month',
  'saldo.income_month': 'Income this month',
  'saldo.expense_month': 'Spending this month',
  'saldo.verdict_near_limit':
    '● Approaching your safety floor — consider pulling back on spending.',
  'saldo.verdict_below_limit': '● Your budget is below your safety floor — cut spending now.',
  'saldo.formula_title': 'Where does this number come from?',
  'saldo.formula_intro':
    "Operating Budget isn't just what's in your wallets. Some of it is already spoken for.",
  'saldo.formula_total_wallets': 'Total balance across all wallets',
  'saldo.formula_bills_label': 'Unpaid bills in this period',
  'saldo.formula_bills_sublabel': '(reserved for payment)',
  'saldo.formula_savings_label': 'Money currently being saved',
  'saldo.formula_savings_sublabel': '(set aside, not for spending)',
  'saldo.formula_total_label': 'Operating Budget',
  'saldo.formula_note':
    "This is your actual spending budget — not just what's left in your account.",
  'saldo.jatah_harian_label': 'Daily Budget',
  'saldo.jatah_harian_tooltip':
    'Divided from the starting balance of this period — your daily allowance. Fixed at the start, not recalculated daily.',
  'saldo.anggaran_tooltip':
    'Period income minus unpaid bills and savings targets. This is your free money for daily operations.',
  'saldo.expand_btn': 'how is this calculated?',
  'saldo.collapse_btn': 'hide',
  'saldo.rincian_tagihan': '− Unpaid bills',
  'saldo.rincian_nabung': '− Already saved',
  'saldo.rincian_anggaran': '= Left now',
  'saldo.rincian_hari_periode': '+ {n} days in period',
  'saldo.rincian_jatah': '= Daily Budget',
  'saldo.rincian_udah_jalan': '{x} days in → {amount} left',
  'saldo.total_saldo_label': 'total wallets',
  'saldo.uang_mengendap_label': 'Parked Money',
  'saldo.uang_mengendap_sub': 'outside this period',
  'saldo.rincian_udah_kepakai': '− Already spent',
  'saldo.sisa_periode_label': 'Period balance',
  'saldo.uang_mengendap_tooltip': 'Idle balance — safe to leave alone, not for daily spending.',
  'saldo.mode_bertahan_badge': 'SURVIVAL MODE',
  'saldo.mode_bertahan_msg':
    "Your money is fully booked until payday — here's what you need to cover:",
  'saldo.mode_bertahan_shortfall_label': 'SHORTFALL',
  'saldo.mode_bertahan_aman_mulai': 'Safe from',
  'saldo.mode_bertahan_note': "Bills + savings targets exceed this period's income.",
  'saldo.mode_harigajian_badge': 'Payday',
  'saldo.mode_harigajian_heading': 'Did your salary arrive?',
  'saldo.mode_harigajian_sub': 'Confirm so your daily budget can be calculated for the new period.',
  'saldo.mode_harigajian_yes': 'Yes, confirm',
  'saldo.mode_harigajian_no': 'Not yet',
  'saldo.mode_harigajian_ringkasan': 'LAST PERIOD SUMMARY',
  'saldo.mode_harigajian_sisa_anggaran': 'Budget left',
  'saldo.mode_harigajian_total_saldo': 'Total Balance',
  'saldo.mode_harigajian_uang_mengendap': 'Parked Money',
  'saldo.mode_hariterakhir_badge': 'Last day',
  'saldo.mode_hariterakhir_sub_label': 'Left today',
  'saldo.mode_hariterakhir_note':
    'Last day of the period. Tomorrow a new period starts and the daily budget resets.',

  'tagihan_module.title': 'bills this month',
  'tagihan_module.empty_text':
    'Track recurring bills — utilities, internet, subscriptions — to keep your budget accurate.',
  'tagihan_module.more': '{n} more bills',
  'tagihan_module.swipe_hint': 'swipe left to mark as paid',
  'tagihan_module.add': '+ Add bill',
  'tagihan_module.chip_unpaid': 'Unpaid',
  'tagihan_module.chip_paid': 'Paid',
  'tagihan_module.unpaid_label': 'Total unpaid bills',
  'tagihan_module.pill_unpaid': 'unpaid',
  'tagihan_module.pill_paid': 'paid',
  'tagihan_module.idr_lunas': 'IDR · paid',
  'tagihan_module.all_paid': 'All paid',
  'tagihan_module.all_paid_sub': '{n} bills · this month',
  'tagihan_module.ctx_total': 'Total {total}',
  'tagihan_module.ctx_paid': 'Paid {paid}',

  'notif.both': '{n} commitments overdue & due today',
  'notif.overdue': '{n} commitments overdue',
  'notif.due_today': '{n} commitments due today',
  'notif.extra': '+{n} more',

  'backup.title_urgent': "Haven't backed up in a while!",
  'backup.title_normal': 'Back up your data',
  'backup.desc': "SISA data lives on this phone. Switch phones without a backup and it's gone.",
  'backup.guide_btn': 'How to back up ›',
  'backup.guide_title': 'How to back up SISA data',
  'backup.guide_got_it': 'Got it',

  'footer.last_recorded': 'last recorded:',
  'footer.minutes_ago': '{n} min ago',
  'footer.hours_ago': '{n} hours ago',
  'footer.days_ago': '{n} days ago',
  'footer.no_records': 'no records yet',
  'footer.all_records': 'all records ›',
  'footer.tx_fallback': 'Transaction',

  'actions.log_aria': 'Log transaction',
  'actions.log_label': 'Log',
  'actions.cek_aria': 'Check First — can I buy this?',
  'actions.cek_label': 'Check First',
  'actions.cek_sub': 'can I buy this right now?',
  'actions.andai_aria': 'What If',
  'actions.andai_label': 'What If',
  'actions.log_full_label': 'Log expense / income',

  'decision.heading_line1': 'Safe to',
  'decision.heading_line2': 'buy now?',
  'decision.input_placeholder': 'How much is it?',
  'decision.cek_btn': 'Check now',
  'decision.andai_prefix': 'or',
  'decision.andai_link': 'simulate with Andai →',

  'cek.empty.heading': 'Get to know your finances',
  'cek.empty.body':
    'Add your bills and wallet first — then this card can show your financial condition and run what-if simulations.',
  'cek.empty.cta': 'Add your first bill',
  'cek.badge_estimasi': 'ESTIMATE',
  'cek.badge_akurat': 'ACCURATE',
  'cek.section_label': 'DATA COMPLETENESS',
  'cek.item_tagihan': 'Bills',
  'cek.item_wallet': 'Wallet',
  'cek.item_tabungan': 'Savings',
  'cek.done_tagihan': '{n} bills added',
  'cek.need_fill': 'Needs setup',
  'cek.optional': 'optional',
  'cek.disclaimer': 'Estimate may be off — add your {item} data',
  'cek.row_sisa': 'Est. remaining',
  'cek.row_tagihan': 'Fixed bills',
  'cek.andai_warning': 'Available after {item} is set up',
  'cek.cta_add': 'Add {item} now',
  'cek.nabung_cta': 'Log savings',

  'history.title': 'History',
  'history.filter_all': 'All',
  'history.filter_keluar': 'Out',
  'history.filter_masuk': 'In',
  'history.filter_nabung': 'Savings',
  'history.empty': 'No records yet',
  'history.type_keluar': 'Expense',
  'history.type_masuk': 'Income',
  'history.type_nabung': 'Savings',
  'history.type_tagihan': 'Bill',
  'history.type_transfer': 'Transfer',
  'history.today': 'Today',
  'history.yesterday': 'Yesterday',
  'history.edit_aria': 'Edit',
  'history.delete_aria': 'Delete',

  'mark_paid.title': 'Pay {name}',
  'mark_paid.nominal': 'Amount',
  'mark_paid.from': 'Pay from',
  'mark_paid.date_label': 'Date',
  'mark_paid.estimate': 'estimate: {amount}',
  'mark_paid.insufficient': 'Not enough balance in {wallet} for this payment.',
  'mark_paid.submit': 'Mark as Paid',

  'tagihan_detail.due_date_label': 'Due date',
  'tagihan_detail.nominal': 'Amount',
  'tagihan_detail.due_day': 'Day {day}',
  'tagihan_detail.status': 'Status',
  'tagihan_detail.last_paid': 'Last paid',
  'tagihan_detail.status_paid': 'Paid this month',
  'tagihan_detail.status_overdue': 'Overdue',
  'tagihan_detail.status_due_today': 'Due today',
  'tagihan_detail.status_unpaid': 'Unpaid',
  'tagihan_detail.mark_paid': 'Mark as Paid',
  'tagihan_detail.delete_confirm': 'Delete {name}?',
  'tagihan_detail.urgent_title': 'Urgent commitments',
  'tagihan_detail.overdue_days': '{n} days overdue',
  'tagihan_detail.due_today': 'Due today',
  'tagihan_detail.pay_btn': 'Pay',

  'tagihan_swipe.mark_paid_aria': 'Mark as paid',
  'tagihan_swipe.mark_paid_label': 'mark paid',
  'tagihan_swipe.paid_badge': 'paid',

  'toast.edit': 'Edit',
  'toast.undo': 'Undo',

  'home.toast_paid': '{name} marked as paid',
  'home.toast_masuk': 'Income logged',
  'home.toast_keluar': 'Expense logged',
  'home.days_to_payday': '{n} days to payday',
  'home.day_to_payday': '{n} day to payday',
  'home.saldo_bebas': 'Left',
  'home.monthly_title': 'This Month',
  'home.income_label': 'Income',
  'home.expense_label': 'Expense',
  'home.savings_label': 'Savings',
  'home.payday_confirm_title': 'Did your salary arrive?',
  'home.payday_confirm_sub': 'If yes, SISA resets your daily budget from now.',
  'home.payday_confirm_yes': "Yes, it's in",
  'home.payday_confirm_no': 'Not yet',

  'equiv.approx': '≈ {equiv} · rate {date}',

  'wallets.total_label': 'total wealth',
  'wallets.total_label_fallback': 'total wealth ({currency})',
  'wallets.fallback_note': '{currencies} not included · rate unavailable',
  'wallets.rate_unavailable': 'rate unavailable',
  'wallets.collapse': 'Hide',

  'push.ask_title': 'Get reminded before due dates?',
  'push.ask_body':
    'We send a notification when a bill is due and the day after — so you never miss it.',
  'push.ask_cta': 'Yes, remind me',
  'push.ask_later': 'Maybe later',

  'quick_log.mode_keluar': 'out',
  'quick_log.mode_masuk': 'in',
  'quick_log.date_label': 'Pick date',
  'quick_log.date_custom_aria': 'Pick another date',
  'quick_log.submitting': 'Saving...',
  'quick_log.submit_edit': 'Save',
  'quick_log.submit_new': 'Log',
  'quick_log.label_placeholder': 'coffee, grab, groceries...',
  'category.manage_btn': 'Manage',
  'settings.row_categories': 'Categories',
  'settings.row_categories_sub': 'Manage expense & income categories',

  'cek_dulu.title': 'Check First',
  'cek_dulu.sub': 'can I buy this right now?',
  'cek_dulu.close_aria': 'Close',
  'cek_dulu.price_label': 'item price',
  'cek_dulu.context_line': '{days} days until payday',
  'cek_dulu.col_now': 'now',
  'cek_dulu.col_after': 'if you buy',
  'cek_dulu.daily_label': 'daily budget until payday',
  'cek_dulu.daily_unit': '/day',
  'cek_dulu.sisa_label': 'operating budget',
  'cek_dulu.new_flag': 'newly visible',
  'cek_dulu.mengendap_label': 'parked money dip',
  'cek_dulu.mengendap_note': 'To cover this, {amount} would come from Parked Money.',
  'cek_dulu.src_label': 'calculated from operating budget',
  'cek_dulu.src_wallets': '{n} wallets · {amount}',
  'cek_dulu.close_btn': 'Close',
  'cek_dulu.buy_label': 'Go ahead — log as expense',
  'cek_dulu.buy_sub': 'records to history as an expense',
  'cek_dulu.insight_days':
    'This costs {n} days of your daily budget — imagine those days already claimed before they even start.',
  'cek_dulu.insight_portion':
    'This purchase takes {pct}% of your remaining money right now. The bigger the percentage, the less wiggle room you have for everything else this month.',
  'cek_dulu.insight_recovery':
    "This dips into your savings. It'll take around {n} days of consistent saving to get back to where you are now — make sure it's worth it.",

  'andai.title': 'What If',
  'andai.sub': 'hypothetical scenarios',
  'andai.back_aria': 'Back',
  'andai.baseline_label': 'now · no changes',
  'andai.baseline_saldo': 'operating budget',
  'andai.stack_label': 'what if...',
  'andai.remove_aria': 'Remove',
  'andai.kind_beli': 'expense',
  'andai.kind_income': 'income',
  'andai.kind_tagihan': 'bill',
  'andai.result_label': 'if all this happened',
  'andai.result_daily': 'daily budget\nuntil payday',
  'andai.result_sisa': 'remaining money',
  'andai.reset': 'Reset',
  'andai.save': 'Save',
  'andai.compare': 'Compare',
  'andai.compare_bar': 'Compare these 2 scenarios',
  'andai.add_event': '+ add event',
  'andai.add_desc_label': 'Description (optional)',
  'andai.add_nominal_label': 'Amount',
  'andai.add_submit': 'Add',
  'andai.placeholder_beli': 'e.g. car service',
  'andai.placeholder_income': 'e.g. salary, freelance',
  'andai.placeholder_tagihan': 'e.g. new subscription',
  'andai.scenarios_label': 'saved scenarios',
  'andai.scenarios_delete_aria': 'Delete scenario',
  'andai.scenarios_delete_label': 'delete',
  'andai.save_sheet_title': 'Save scenario',
  'andai.save_sheet_label': 'Scenario name',
  'andai.save_sheet_placeholder': 'e.g. buy scooter + freelance',
  'andai.save_sheet_submit': 'Save',
  'andai.compare_sheet_title': 'Compare scenarios',
  'andai.compare_daily': 'daily budget',
  'andai.compare_sisa': 'operating budget',
  'andai.baseline_mengendap': 'parked money',
  'andai.income_disclaimer':
    '* Income in What If is assumed immediately available — not a date prediction.',
  'andai.insight_days':
    'This scenario burns through {n} days of your daily budget — if all of this happens, those days are gone before they start.',
  'andai.insight_portion':
    'The net effect of this scenario takes {pct}% of your remaining balance until payday. The bigger that number, the less room you have for everything else.',
  'andai.insight_recovery':
    "This scenario reduces your savings. Getting back to where you are now takes around {n} days of consistent saving — weigh whether it's worth it.",

  'profil.wallets_title_list': 'Wallets',
  'profil.wallets_title_add': 'Add wallet',
  'profil.wallets_name_label': 'wallet name',
  'profil.wallets_balance_label': 'actual balance now',
  'profil.wallets_sesuaikan_btn': 'Adjust balance',
  'profil.wallets_delete_btn': 'Delete wallet',
  'profil.wallets_delete_confirm': 'Delete {name}?',
  'profil.wallets_diff_prefix': 'difference',
  'profil.wallets_diff_from': 'what caused the difference?',
  'profil.wallets_opt_lupa': 'Forgot to log it',
  'profil.wallets_opt_transfer': 'Transferred to another wallet',
  'profil.wallets_transfer_pick_label': 'pick target wallet',
  'profil.wallets_transfer_confirm': 'Confirm transfer',
  'profil.wallets_initial_balance': 'opening balance',
  'profil.wallets_add_btn': 'Add wallet',
  'profil.wallets_add_placeholder': 'e.g. Chase, Cash',
  'profil.wallets_add_more': '+ Add wallet',
  'profil.wallets_currency_label': 'Currency',

  'profil.income_title': 'Income profile',
  'profil.income_type_label': 'income type',
  'profil.income_type_tetap': 'fixed',
  'profil.income_type_freelance': 'freelance',
  'profil.income_type_mix': 'mixed',
  'profil.income_day_label': 'payday (1–31)',
  'profil.income_weekend_label': 'if it lands on a weekend',
  'profil.income_weekend_maju': 'Move earlier (Friday)',
  'profil.income_weekend_mundur': 'Push back (Monday)',
  'profil.income_weekend_tetap': 'Keep on that day',
  'profil.income_freelance_note':
    'Freelance: balance = min end-of-month balance. Payday = last day of month.',
  'profil.income_save': 'Save',

  'profil.license_title': 'License',
  'profil.license_status_label': 'status',
  'profil.license_active': 'active',
  'profil.license_expires_label': 'valid until',
  'profil.license_days_left': '{n} days left · until {date}',
  'profil.license_not_active': 'License not activated.',
  'profil.license_change': 'Change license key',
  'profil.license_enter': 'Enter license key',
  'profil.license_verifying': 'Verifying…',
  'profil.license_activate': 'Activate',
  'profil.license_buy_label': 'renew / buy new',
  'profil.license_err_invalid': 'Invalid key or signature mismatch.',
  'profil.license_err_expired': 'Key has expired.',
  'profil.license_success': 'License activated!',

  'profil.tagihan_currency_label': 'Currency',
  'profil.tagihan_title_list': 'Bills',
  'profil.tagihan_title_edit': 'Edit bill',
  'profil.tagihan_title_add': 'Add bill',
  'profil.tagihan_empty': 'No bills yet.',
  'profil.tagihan_name_label': 'bill name',
  'profil.tagihan_name_placeholder': 'e.g. Netflix, electricity',
  'profil.tagihan_nominal_label': 'amount',
  'profil.tagihan_fixed': 'always fixed',
  'profil.tagihan_variable': 'can vary',
  'profil.tagihan_due_label': 'due date (1–31)',
  'profil.tagihan_freq_label': 'frequency',
  'profil.tagihan_rutin': 'recurring',
  'profil.tagihan_sekali': 'one-time',
  'profil.tagihan_freq_sekali': 'One-time',
  'profil.tagihan_freq_mingguan': 'Weekly',
  'profil.tagihan_freq_2mingguan': 'Biweekly',
  'profil.tagihan_freq_bulanan': 'Monthly',
  'profil.tagihan_freq_2bulanan': 'Bimonthly',
  'profil.tagihan_freq_3bulanan': 'Quarterly',
  'profil.tagihan_freq_tahunan': 'Yearly',
  'profil.tagihan_date_label': 'Date',
  'profil.tagihan_weekday_label': 'Day',
  'profil.tagihan_anchor_month_label': 'Starting month',
  'profil.tagihan_annual_month_label': 'Month',
  'profil.tagihan_add_btn': '+ Add bill',

  'settings.title': 'settings',
  'settings.back_aria': 'Back',
  'settings.profile_active_until': 'Active until {date} · {n} days left',
  'settings.profile_not_active': 'Not active',
  'settings.section_profil': 'profile',
  'settings.row_income': 'income',
  'settings.row_income_sub': 'type & payday',
  'settings.section_tampilan': 'display',
  'settings.row_theme': 'theme',
  'settings.theme_light': 'light',
  'settings.theme_dark': 'dark',
  'settings.theme_system': 'system',
  'settings.dark_note': 'dark = v2 · not yet available',
  'settings.row_language': 'language',
  'settings.row_patokan_currency': 'Main Currency',
  'settings.row_patokan_currency_sub': 'Used for most of your living costs',
  'settings.currency_warning_title': 'Change main currency',
  'settings.currency_warning_body':
    "Changing your main currency won't convert saved amounts. Rp 50,000 becomes $50,000, not converted.",
  'settings.section_data': 'data & backup',
  'settings.export_json': 'export backup',
  'settings.export_json_sub': 'full file for transfer / restore',
  'settings.export_csv': 'export transactions',
  'settings.export_csv_sub': 'open in a spreadsheet',
  'settings.import': 'import from backup',
  'settings.import_sub': 'restore from a .json file',
  'settings.delete': 'delete all data',
  'settings.delete_sub': 'cannot be undone',
  'settings.section_about': 'about',
  'settings.made_by': 'made by',
  'settings.contact': 'twitter',
  'settings.email': 'email',
  'settings.import_preview_title': 'Import backup',
  'settings.import_preview_wallets': 'wallets',
  'settings.import_preview_txs': 'transactions',
  'settings.import_preview_bills': 'bills',
  'settings.import_preview_goals': 'goals',
  'settings.import_warning': 'Existing data will be overwritten. Cannot be undone.',
  'settings.import_confirm': 'Restore now',
  'settings.import_error_title': 'Import failed',
  'settings.delete_title': 'Delete all data',
  'settings.delete_warning':
    'All transactions, wallets, bills, and goals will be permanently deleted. License is kept.',
  'settings.delete_next': 'Continue to delete',
  'settings.delete_type_prompt': 'Type DELETE to confirm',
  'settings.delete_type_word': 'DELETE',
  'settings.delete_type_placeholder': 'DELETE',
  'settings.delete_confirm_btn': 'Delete all data',

  'alokasi.buat_dipakai': 'Daily operational money',
  'alokasi.uang_mengendap': 'Parked Money',
  'alokasi.mengendap_note': 'Parked Money can be Rp 0.',
  'alokasi.jatah_harian_approx': 'Daily budget ≈',
  'alokasi.sampai_gajian': 'until next payday',
  'alokasi.sampai_akhir_bulan': 'until end of month',
  'alokasi.atur_ulang_title': 'Reallocate',
  'alokasi.bisa_kamu_atur': 'Amount you can allocate',
  'alokasi.ubah_dipakai': 'Set your allocation',
  'alokasi.mengendap_auto': 'AUTO',

  'home.sisa_uang': 'YOUR MONEY LEFT',
  'home.sisa_uang_tooltip':
    "This is the money that's safe to spend until your next payday.\n\nHow it's calculated:\nTotal balance across all wallets\n− Unpaid bills\n− Parked Money (money you set aside, not for spending)\n= Your money left\n\nYour daily budget comes from this divided by days remaining until payday.",
  'home.insight_teaser_ratio': "You've used {pct}% of income this month",
  'home.insight_teaser_clean': 'No spending yet this month. Clean start',
  'home.insight_teaser_spend_only': "You've spent {jumlah} this month",
  'home.insight_teaser_generic': 'Your first entries will show up as insights here',
  'home.insight_card_label': 'INSIGHTS',
  'home.insight_card_cta': 'View Insights →',
  'home.expand_show': 'how is this possible?',
  'home.expand_hide': 'hide',
  'home.duit_di_mana': 'Where your money is',
  'home.bulan_ini': 'This month',
  'home.lihat_riwayat': 'view history →',
  'home.dompet': 'Wallets',
  'home.tambah_dompet': '+ Add wallet',
  'home.wallets_empty_title': 'No wallets yet',
  'home.wallets_empty_sub': 'add your first wallet to start tracking',
  'home.wallets_more': '+ {n} more wallets',
  'home.atur_alokasi': 'set',
  'home.banner_gajian_title': 'Got paid?',
  'home.banner_gajian_body': 'Got paid? Reallocate your budget.',
  'home.banner_periode_title': 'Period ended',
  'home.banner_periode_body': 'Your period ended — reallocate your budget.',
  'home.banner_cta': 'Reallocate →',
  'home.jatah_harian_label': 'Daily Budget',
  'home.jatah_keluar': 'Spent today',
  'home.jatah_lewat_badge': '⚠ Over',
  'home.jatah_lewat_title': 'Today over by {n}',
  'home.jatah_besok': "Tomorrow's budget drops to {n}",

  // insight
  'insight.back_aria': 'Back',
  'insight.hero_hemat': 'You spent {pct}% less than {month}.',
  'insight.hero_hemat_sub': 'spending down {amount} from last month',
  'insight.hero_boros': 'You spent {pct}% more than {month}.',
  'insight.hero_boros_sub': 'spending up {amount} from last month',
  'insight.hero_ratio': 'You used {pct}% of your income this month.',
  'insight.hero_ratio_sub': '{amount} left from total {income}',
  'insight.hero_neutral_calm': 'A calm month.',
  'insight.hero_neutral_fresh': 'A clean start.',
  'insight.hero_neutral_sub': 'Start logging to see insights',
  'insight.card_monthly': 'Monthly Overview',
  'insight.metric_net': 'Net',
  'insight.metric_keluar': 'Out',
  'insight.metric_masuk': 'In',
  'insight.monthly_label_expense': 'Spent',
  'insight.monthly_label_income': 'Earned',
  'insight.monthly_delta_less': '↓ spending {pct}% vs {month}',
  'insight.monthly_delta_more': '↑ spending {pct}% vs {month}',
  'insight.monthly_delta_income_up': '↑ income {pct}% vs {month}',
  'insight.monthly_delta_income_down': '↓ income {pct}% vs {month}',
  'insight.monthly_delta_net_up': '↑ net up {amount} vs {month}',
  'insight.monthly_delta_net_down': '↓ net down {amount} vs {month}',
  'insight.monthly_empty': 'Data is still collecting,\ncheck back soon.',
  'insight.monthly_empty_sub': 'needs at least 2 weeks of data',
  'insight.card_category': 'Monthly Categories',
  'insight.cat_empty': 'No categorised transactions\nthis month.',
  'insight.cat_empty_sub': 'first log = first insight data',
  'insight.cat_delta_up': '↑ up {pct}% from {month}',
  'insight.cat_delta_down': '↓ down {pct}% from {month}',
  'insight.cat_no_prev': 'new this month',
  'insight.cat_pct_of_total': "{pct}% of this month's spending",
  'insight.card_spend_pct': 'Monthly Spend Rate',
  'insight.spend_pct_from': 'of income this month',
  'insight.spend_pct_used': 'spent · {amount}',
  'insight.spend_pct_left': 'left · {amount}',
  'insight.spend_pct_empty': 'Add your income first\nso the ratio can be calculated.',
  'insight.spend_pct_empty_sub': 'set income in profile settings',
  'insight.card_daily': 'Daily Rhythm',
  'insight.daily_empty': 'No expenses yet\nthis month.',
  'insight.daily_empty_sub': 'start logging — your patterns will show up here',
  'insight.daily_legend_low': 'few',
  'insight.daily_legend_high': 'many',
  'insight.daily_sheet_empty': 'No transactions this day.',
  'insight.daily_sheet_total': 'Total',
  'insight.card_ranking': 'Category Ranking',
  'insight.ranking_vs': 'vs {month}',
  'insight.ranking_empty': 'No categories\nlogged this month.',
  'insight.ranking_empty_sub': 'add a category to each transaction',
  'insight.card_top_tx': '5 Biggest Transactions',
  'insight.top_tx_empty': 'No transactions\nthis month yet.',
  'insight.top_tx_empty_sub': 'your first transaction will appear here',
  'insight.fx_skip': 'some foreign currency transactions excluded',
  'insight.nav_aria': 'View insights',
}

const strings: Record<Language, StringDictionary> = { id, en }

export function t(key: StringKey, lang: Language): string {
  return strings[lang][key] ?? strings.id[key]
}

export function toLocale(lang: Language): string {
  return lang === 'en' ? 'en-US' : 'id-ID'
}
