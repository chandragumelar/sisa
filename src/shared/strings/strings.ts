import type { Language } from '@/db/database'

export type StringKey =
  // common
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.close'
  | 'common.back_aria'
  | 'common.ok'
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
  | 'ob.step4b.min_balance_optional'
  | 'ob.step4b.min_balance_required'
  | 'ob.step4b.min_balance_hint'
  | 'ob.step4b.next'
  // onboarding step 4c
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
  // onboarding step 4e
  | 'ob.step4e.heading'
  | 'ob.step4e.sub'
  | 'ob.step4e.placeholder'
  | 'ob.step4e.skip'
  | 'ob.step4e.add'
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
  | 'saldo.add_wallet'
  | 'saldo.verdict_near_limit'
  | 'saldo.verdict_below_limit'
  // goal module
  | 'goal.title'
  | 'goal.empty_text'
  | 'goal.empty_title'
  | 'goal.empty_hint'
  | 'goal.saving'
  | 'goal.reached'
  | 'goal.waiting'
  | 'goal.add'
  | 'goal.reorder_hint'
  | 'goal.reorder_hint_new'
  | 'goal.menabung'
  | 'goal.status_belum'
  | 'goal.status_sedang'
  | 'goal.prioritas'
  | 'goal.antrian_label'
  | 'goal.not_saved'
  | 'goal.toast_title'
  | 'goal.toast_cta'
  | 'goal.toast_dismiss'
  // tagihan module
  | 'tagihan_module.title'
  | 'tagihan_module.empty_text'
  | 'tagihan_module.more'
  | 'tagihan_module.swipe_hint'
  | 'tagihan_module.add'
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
  | 'home.toast_nabung'
  | 'home.toast_masuk'
  | 'home.toast_keluar'
  | 'home.days_to_payday'
  | 'home.day_to_payday'
  // quick log sheet
  | 'quick_log.mode_keluar'
  | 'quick_log.mode_masuk'
  | 'quick_log.mode_nabung'
  | 'quick_log.savings_warning'
  | 'quick_log.from_savings'
  | 'quick_log.date_label'
  | 'quick_log.date_custom_aria'
  | 'quick_log.submitting'
  | 'quick_log.submit_edit'
  | 'quick_log.submit_new'
  | 'quick_log.add_note'
  | 'quick_log.note_placeholder'
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
  | 'cek_dulu.tabungan_label'
  | 'cek_dulu.tabungan_note'
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
  | 'andai.baseline_tabungan'
  | 'andai.stack_label'
  | 'andai.remove_aria'
  | 'andai.kind_beli'
  | 'andai.kind_income'
  | 'andai.kind_tagihan'
  | 'andai.kind_target_nabung'
  | 'andai.result_label'
  | 'andai.result_daily'
  | 'andai.result_sisa'
  | 'andai.result_tabungan'
  | 'andai.reset'
  | 'andai.save'
  | 'andai.compare'
  | 'andai.compare_bar'
  | 'andai.add_event'
  | 'andai.add_desc_label'
  | 'andai.add_nominal_label'
  | 'andai.add_target_label'
  | 'andai.add_submit'
  | 'andai.placeholder_beli'
  | 'andai.placeholder_income'
  | 'andai.placeholder_tagihan'
  | 'andai.placeholder_nabung'
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
  | 'andai.compare_tabungan'
  | 'andai.insight_days'
  | 'andai.insight_portion'
  | 'andai.insight_recovery'
  // profil – goals
  | 'profil.goals_title_list'
  | 'profil.goals_title_edit'
  | 'profil.goals_title_add'
  | 'profil.goals_empty'
  | 'profil.goals_reorder_hint'
  | 'profil.goals_name_label'
  | 'profil.goals_name_placeholder'
  | 'profil.goals_target_label'
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
  | 'profil.wallets_opt_koreksi'
  | 'profil.wallets_transfer_pick_label'
  | 'profil.wallets_transfer_confirm'
  | 'profil.wallets_initial_balance'
  | 'profil.wallets_add_btn'
  | 'profil.wallets_add_placeholder'
  | 'profil.wallets_add_more'
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
  | 'profil.income_weekend_inconsistent'
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
  | 'settings.row_secondary_currency'
  | 'settings.no_secondary_currency'
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
  | 'settings.currency_blocked_title'
  | 'settings.currency_blocked_warning'
  | 'settings.import_error_title'
  | 'settings.delete_title'
  | 'settings.delete_warning'
  | 'settings.delete_next'
  | 'settings.delete_type_prompt'
  | 'settings.delete_type_word'
  | 'settings.delete_type_placeholder'
  | 'settings.delete_confirm_btn'

export type StringDictionary = Record<StringKey, string>

const id: StringDictionary = {
  'common.save': 'Simpan',
  'common.cancel': 'Batal',
  'common.delete': 'Hapus',
  'common.close': 'Tutup',
  'common.back_aria': 'Kembali',
  'common.ok': 'Oke',
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
    'Kalau ada gaji tetap, isi tanggalnya. Income lain bisa dicatat manual nanti.',
  'ob.step4b.sub_freelance':
    'Karena nggak ada tanggal gajian pasti, SISA pakai ini sebagai patokan aman. Lo yang tentuin angkanya.',
  'ob.step4b.payday_label': 'Tanggal gajian',
  'ob.step4b.payday_placeholder': 'Pilih tanggal…',
  'ob.step4b.payday_day': 'Tanggal {d}',
  'ob.step4b.min_balance_optional': 'Minimum saldo aman (opsional)',
  'ob.step4b.min_balance_required': 'Minimum saldo aman',
  'ob.step4b.min_balance_hint': 'SISA akan kasih peringatan kalau saldo lo di bawah angka ini.',
  'ob.step4b.next': 'Lanjut',

  'ob.step4c.heading': 'Mata uang utama',
  'ob.step4c.sub': 'Semua nominal akan ditampilkan dalam mata uang ini.',
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

  'ob.step4e.heading': 'Mata uang kedua',
  'ob.step4e.sub': 'Lo bisa pantau dua mata uang sekaligus. Bisa diatur ulang nanti.',
  'ob.step4e.placeholder': 'Pilih mata uang kedua…',
  'ob.step4e.skip': 'Nanti aja',
  'ob.step4e.add': '+ Tambah',

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
  'saldo.add_wallet': '+ Tambah dompet',
  'saldo.verdict_near_limit':
    '● Mendekati batas aman lo — pertimbangkan kurangi pengeluaran sekarang.',
  'saldo.verdict_below_limit':
    '● Saldo bebas lo sudah di bawah batas aman — kurangi pengeluaran segera.',

  'goal.title': 'mimpi lo',
  'goal.empty_text':
    'misal: laptop 20jt, liburan Bali, dana darurat — supaya lo tau lagi nabung buat apa.',
  'goal.empty_title': 'Tulis mimpi lo di sini',
  'goal.empty_hint': 'Lalu menabung di tab Menabung — mimpi paling atas otomatis terisi duluan.',
  'goal.saving': 'menabung →',
  'goal.reached': 'tercapai ✓',
  'goal.waiting': 'nunggu giliran',
  'goal.add': '+ Catat mimpi baru',
  'goal.reorder_hint': 'nabung lagi: {name} · tahan & geser untuk ganti urutan',
  'goal.reorder_hint_new': 'Geser mimpi untuk atur urutan',
  'goal.menabung': 'Menabung',
  'goal.status_belum': 'belum menabung',
  'goal.status_sedang': 'sedang ditabung',
  'goal.prioritas': 'prioritas',
  'goal.antrian_label': 'antrian',
  'goal.not_saved': 'Belum ada yang ditabung',
  'goal.toast_title': 'Mimpi tercatat!',
  'goal.toast_cta': 'Mulai menabung sekarang',
  'goal.toast_dismiss': 'Nanti saja',

  'tagihan_module.title': 'tagihan bulan ini',
  'tagihan_module.empty_text':
    'Catat tagihan rutin — listrik, internet, streaming — biar budget lo akurat dan gak kecolongan.',
  'tagihan_module.more': '{n} tagihan lainnya',
  'tagihan_module.swipe_hint': 'geser kiri untuk tandai dibayar',
  'tagihan_module.add': '+ Tambah tagihan',

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
  'home.toast_nabung': 'Nabung dicatat',
  'home.toast_masuk': 'Pemasukan dicatat',
  'home.toast_keluar': 'Pengeluaran dicatat',
  'home.days_to_payday': '{n} hari ke gajian',
  'home.day_to_payday': '{n} hari ke gajian',

  'quick_log.mode_keluar': 'keluar',
  'quick_log.mode_masuk': 'masuk',
  'quick_log.mode_nabung': 'nabung',
  'quick_log.savings_warning': 'Tabungan kamu cuma {amount} — mau pakai semua tabungan?',
  'quick_log.from_savings': 'dari tabungan',
  'quick_log.date_label': 'Pilih tanggal',
  'quick_log.date_custom_aria': 'Pilih tanggal lain',
  'quick_log.submitting': 'Menyimpan...',
  'quick_log.submit_edit': 'Simpan',
  'quick_log.submit_new': 'Catat',
  'quick_log.add_note': '+ tambah catatan',
  'quick_log.note_placeholder': 'Catatan...',

  'cek_dulu.title': 'Cek Dulu',
  'cek_dulu.sub': 'aman ga gue beli ini?',
  'cek_dulu.close_aria': 'Tutup',
  'cek_dulu.price_label': 'harga barang',
  'cek_dulu.context_line': 'sampai gajian: {days} hari lagi · saldo total {amount}',
  'cek_dulu.col_now': 'sekarang',
  'cek_dulu.col_after': 'kalau beli',
  'cek_dulu.daily_label': 'jatah harian sampai gajian',
  'cek_dulu.daily_unit': '/hari',
  'cek_dulu.sisa_label': 'sisa operasional',
  'cek_dulu.new_flag': 'baru muncul',
  'cek_dulu.tabungan_label': 'tabungan kepotong',
  'cek_dulu.tabungan_note': 'Buat nutupin, {amount} ketarik dari tabungan.',
  'cek_dulu.src_label': 'dihitung dari saldo total',
  'cek_dulu.src_wallets': '{n} dompet · {amount}',
  'cek_dulu.close_btn': 'Tutup',
  'cek_dulu.buy_label': 'Jadi beli — catat keluar',
  'cek_dulu.buy_sub': 'masuk ke history sebagai pengeluaran',
  'cek_dulu.insight_days':
    'Harga ini setara {n} hari jatah harian lo — bayangkan sejumlah hari itu sudah "dipesan" duluan oleh pembelian ini.',
  'cek_dulu.insight_portion':
    'Pembelian ini makan {pct}% dari total sisa lo sampai gajian. Semakin besar angkanya, semakin sempit ruang gerak untuk kebutuhan lain bulan ini.',
  'cek_dulu.insight_recovery':
    'Pembelian ini nyentuh tabungan lo. Butuh sekitar {n} hari nabung konsisten buat balik ke posisi sekarang — pastiin ini worth it dulu.',

  'andai.title': 'Andai',
  'andai.sub': 'skenario hipotetis',
  'andai.back_aria': 'Kembali',
  'andai.baseline_label': 'sekarang · tanpa diandai',
  'andai.baseline_saldo': 'saldo operasional',
  'andai.baseline_tabungan': 'total tabungan',
  'andai.stack_label': 'andai...',
  'andai.remove_aria': 'Hapus',
  'andai.kind_beli': 'beli',
  'andai.kind_income': 'income',
  'andai.kind_tagihan': 'tagihan',
  'andai.kind_target_nabung': 'target nabung',
  'andai.result_label': 'kalau semua ini kejadian',
  'andai.result_daily': 'jatah harian sampai gajian',
  'andai.result_sisa': 'sisa operasional',
  'andai.result_tabungan': 'total tabungan',
  'andai.reset': 'Reset',
  'andai.save': 'Simpan',
  'andai.compare': 'Banding',
  'andai.compare_bar': 'Bandingkan 2 skenario ini',
  'andai.add_event': '+ tambah kejadian',
  'andai.add_desc_label': 'Deskripsi (opsional)',
  'andai.add_nominal_label': 'Nominal',
  'andai.add_target_label': 'Target per bulan',
  'andai.add_submit': 'Tambah',
  'andai.placeholder_beli': 'e.g. service mobil',
  'andai.placeholder_income': 'e.g. gaji, freelance',
  'andai.placeholder_tagihan': 'e.g. langganan baru',
  'andai.placeholder_nabung': 'e.g. nabung tiap bulan',
  'andai.scenarios_label': 'skenario tersimpan',
  'andai.scenarios_delete_aria': 'Hapus skenario',
  'andai.scenarios_delete_label': 'hapus',
  'andai.save_sheet_title': 'Simpan skenario',
  'andai.save_sheet_label': 'Nama skenario',
  'andai.save_sheet_placeholder': 'e.g. beli motor + freelance',
  'andai.save_sheet_submit': 'Simpan',
  'andai.compare_sheet_title': 'Banding skenario',
  'andai.compare_daily': 'jatah harian',
  'andai.compare_sisa': 'sisa operasional',
  'andai.compare_tabungan': 'total tabungan',
  'andai.insight_days':
    'Skenario ini menggerus {n} hari jatah harian lo — kalau semua ini kejadian, sejumlah hari itu sudah habis sebelum dimulai.',
  'andai.insight_portion':
    'Efek bersih skenario ini mengambil {pct}% dari total sisa lo sampai gajian. Semakin besar angkanya, semakin sempit ruang gerak untuk kebutuhan lain.',
  'andai.insight_recovery':
    'Skenario ini mengurangi tabungan lo. Butuh sekitar {n} hari nabung konsisten untuk balik ke posisi sekarang — timbang lagi apakah worth it.',

  'profil.goals_title_list': 'Goal tabungan',
  'profil.goals_title_edit': 'Edit goal',
  'profil.goals_title_add': 'Tambah goal',
  'profil.goals_empty': 'Belum ada goal.',
  'profil.goals_reorder_hint': 'Urutan goal diatur di Home lewat drag-drop.',
  'profil.goals_name_label': 'nama goal',
  'profil.goals_name_placeholder': 'e.g. Emergency fund, Liburan',
  'profil.goals_target_label': 'target nominal',

  'profil.wallets_title_list': 'Dompet',
  'profil.wallets_title_add': 'Tambah dompet',
  'profil.wallets_name_label': 'nama dompet',
  'profil.wallets_balance_label': 'saldo aktual sekarang',
  'profil.wallets_sesuaikan_btn': 'Sesuaikan saldo',
  'profil.wallets_delete_btn': 'Hapus dompet',
  'profil.wallets_delete_confirm': 'Yakin hapus {name}?',
  'profil.wallets_diff_prefix': 'selisih',
  'profil.wallets_diff_from': 'selisih dari mana?',
  'profil.wallets_opt_lupa': 'Lupa catat — buat transaksi koreksi',
  'profil.wallets_opt_transfer': 'Transfer ke wallet lain — 2 transaksi pasangan',
  'profil.wallets_opt_koreksi': 'Koreksi saja — update angka tanpa transaksi',
  'profil.wallets_transfer_pick_label': 'pilih dompet tujuan',
  'profil.wallets_transfer_confirm': 'Konfirmasi transfer',
  'profil.wallets_initial_balance': 'saldo awal',
  'profil.wallets_add_btn': 'Tambah dompet',
  'profil.wallets_add_placeholder': 'e.g. BCA, Dana, Tunai',
  'profil.wallets_add_more': '+ Tambah dompet',

  'profil.income_title': 'Profil keuangan',
  'profil.income_type_label': 'tipe income',
  'profil.income_type_tetap': 'tetap',
  'profil.income_type_freelance': 'freelance',
  'profil.income_type_mix': 'campuran',
  'profil.income_day_label': 'tanggal gajian (1–31)',
  'profil.income_weekend_label': 'kalau jatuh di weekend',
  'profil.income_weekend_maju': 'Maju ke Jumat',
  'profil.income_weekend_mundur': 'Mundur ke Senin',
  'profil.income_weekend_tetap': 'Tetap di hari itu',
  'profil.income_weekend_inconsistent': 'Tidak konsisten',
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
  'settings.row_secondary_currency': 'mata uang kedua',
  'settings.no_secondary_currency': 'tidak ada',
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
  'settings.currency_blocked_title': 'Mata uang masih dipakai',
  'settings.currency_blocked_warning':
    'Hapus dulu semua dompet, tagihan, dan goal dalam mata uang ini sebelum menonaktifkannya.',
  'settings.import_error_title': 'Gagal import',
  'settings.delete_title': 'Hapus semua data',
  'settings.delete_warning':
    'Semua transaksi, wallet, tagihan, dan goal akan dihapus permanen. Lisensi tetap tersimpan.',
  'settings.delete_next': 'Lanjut hapus',
  'settings.delete_type_prompt': 'Ketik HAPUS untuk konfirmasi',
  'settings.delete_type_word': 'HAPUS',
  'settings.delete_type_placeholder': 'HAPUS',
  'settings.delete_confirm_btn': 'Hapus semua data',
}

const en: StringDictionary = {
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.back_aria': 'Back',
  'common.ok': 'OK',
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
  'ob.step4b.payday_label': 'Payday',
  'ob.step4b.payday_placeholder': 'Choose a date…',
  'ob.step4b.payday_day': 'Day {d}',
  'ob.step4b.min_balance_optional': 'Safe balance floor (optional)',
  'ob.step4b.min_balance_required': 'Safe balance floor',
  'ob.step4b.min_balance_hint': 'SISA will warn you when your balance drops below this.',
  'ob.step4b.next': 'Next',

  'ob.step4c.heading': 'Primary currency',
  'ob.step4c.sub': 'All amounts will show in this currency.',
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

  'ob.step4e.heading': 'Second currency',
  'ob.step4e.sub': 'Track two currencies at once. You can change this later.',
  'ob.step4e.placeholder': 'Choose second currency…',
  'ob.step4e.skip': 'Skip for now',
  'ob.step4e.add': '+ Add',

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
  'saldo.add_wallet': '+ Add wallet',
  'saldo.verdict_near_limit':
    '● Approaching your safety floor — consider pulling back on spending.',
  'saldo.verdict_below_limit': '● Your free balance is below your safety floor — cut spending now.',

  'goal.title': 'your dreams',
  'goal.empty_text': "e.g. laptop, Bali trip, emergency fund — so you know what you're saving for.",
  'goal.empty_title': 'Write your dreams here',
  'goal.empty_hint': 'Then save in the Save tab — the top dream fills first automatically.',
  'goal.saving': 'saving →',
  'goal.reached': 'reached ✓',
  'goal.waiting': 'in queue',
  'goal.add': '+ Add new dream',
  'goal.reorder_hint': 'saving to: {name} · hold & drag to reorder',
  'goal.reorder_hint_new': 'Drag to reorder',
  'goal.menabung': 'Save',
  'goal.status_belum': 'not saving yet',
  'goal.status_sedang': 'currently saving',
  'goal.prioritas': 'priority',
  'goal.antrian_label': 'queue',
  'goal.not_saved': 'Nothing saved yet',
  'goal.toast_title': 'Dream saved!',
  'goal.toast_cta': 'Start saving now',
  'goal.toast_dismiss': 'Maybe later',

  'tagihan_module.title': 'bills this month',
  'tagihan_module.empty_text':
    'Track recurring bills — utilities, internet, subscriptions — to keep your budget accurate.',
  'tagihan_module.more': '{n} more bills',
  'tagihan_module.swipe_hint': 'swipe left to mark as paid',
  'tagihan_module.add': '+ Add bill',

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
  'home.toast_nabung': 'Savings logged',
  'home.toast_masuk': 'Income logged',
  'home.toast_keluar': 'Expense logged',
  'home.days_to_payday': '{n} days to payday',
  'home.day_to_payday': '{n} day to payday',

  'quick_log.mode_keluar': 'out',
  'quick_log.mode_masuk': 'in',
  'quick_log.mode_nabung': 'save',
  'quick_log.savings_warning': 'Your savings are only {amount} — use all your savings?',
  'quick_log.from_savings': 'from savings',
  'quick_log.date_label': 'Pick date',
  'quick_log.date_custom_aria': 'Pick another date',
  'quick_log.submitting': 'Saving...',
  'quick_log.submit_edit': 'Save',
  'quick_log.submit_new': 'Log',
  'quick_log.add_note': '+ add note',
  'quick_log.note_placeholder': 'Note...',

  'cek_dulu.title': 'Check First',
  'cek_dulu.sub': 'can I buy this right now?',
  'cek_dulu.close_aria': 'Close',
  'cek_dulu.price_label': 'item price',
  'cek_dulu.context_line': 'until payday: {days} days · total balance {amount}',
  'cek_dulu.col_now': 'now',
  'cek_dulu.col_after': 'if you buy',
  'cek_dulu.daily_label': 'daily budget until payday',
  'cek_dulu.daily_unit': '/day',
  'cek_dulu.sisa_label': 'operating balance',
  'cek_dulu.new_flag': 'newly visible',
  'cek_dulu.tabungan_label': 'savings dip',
  'cek_dulu.tabungan_note': 'To cover this, {amount} would come from savings.',
  'cek_dulu.src_label': 'calculated from total balance',
  'cek_dulu.src_wallets': '{n} wallets · {amount}',
  'cek_dulu.close_btn': 'Close',
  'cek_dulu.buy_label': 'Go ahead — log as expense',
  'cek_dulu.buy_sub': 'records to history as an expense',
  'cek_dulu.insight_days':
    'This costs {n} days of your daily budget — imagine those days already claimed before they even start.',
  'cek_dulu.insight_portion':
    'This purchase takes {pct}% of your remaining balance until payday. The bigger that number, the less wiggle room you have for everything else this month.',
  'cek_dulu.insight_recovery':
    "This dips into your savings. It'll take around {n} days of consistent saving to get back to where you are now — make sure it's worth it.",

  'andai.title': 'What If',
  'andai.sub': 'hypothetical scenarios',
  'andai.back_aria': 'Back',
  'andai.baseline_label': 'now · no changes',
  'andai.baseline_saldo': 'operating balance',
  'andai.baseline_tabungan': 'total savings',
  'andai.stack_label': 'what if...',
  'andai.remove_aria': 'Remove',
  'andai.kind_beli': 'purchase',
  'andai.kind_income': 'income',
  'andai.kind_tagihan': 'bill',
  'andai.kind_target_nabung': 'savings target',
  'andai.result_label': 'if all this happened',
  'andai.result_daily': 'daily budget until payday',
  'andai.result_sisa': 'operating balance',
  'andai.result_tabungan': 'total savings',
  'andai.reset': 'Reset',
  'andai.save': 'Save',
  'andai.compare': 'Compare',
  'andai.compare_bar': 'Compare these 2 scenarios',
  'andai.add_event': '+ add event',
  'andai.add_desc_label': 'Description (optional)',
  'andai.add_nominal_label': 'Amount',
  'andai.add_target_label': 'Monthly target',
  'andai.add_submit': 'Add',
  'andai.placeholder_beli': 'e.g. car service',
  'andai.placeholder_income': 'e.g. salary, freelance',
  'andai.placeholder_tagihan': 'e.g. new subscription',
  'andai.placeholder_nabung': 'e.g. monthly savings',
  'andai.scenarios_label': 'saved scenarios',
  'andai.scenarios_delete_aria': 'Delete scenario',
  'andai.scenarios_delete_label': 'delete',
  'andai.save_sheet_title': 'Save scenario',
  'andai.save_sheet_label': 'Scenario name',
  'andai.save_sheet_placeholder': 'e.g. buy scooter + freelance',
  'andai.save_sheet_submit': 'Save',
  'andai.compare_sheet_title': 'Compare scenarios',
  'andai.compare_daily': 'daily budget',
  'andai.compare_sisa': 'operating balance',
  'andai.compare_tabungan': 'total savings',
  'andai.insight_days':
    'This scenario burns through {n} days of your daily budget — if all of this happens, those days are gone before they start.',
  'andai.insight_portion':
    'The net effect of this scenario takes {pct}% of your remaining balance until payday. The bigger that number, the less room you have for everything else.',
  'andai.insight_recovery':
    "This scenario reduces your savings. Getting back to where you are now takes around {n} days of consistent saving — weigh whether it's worth it.",

  'profil.goals_title_list': 'Savings goals',
  'profil.goals_title_edit': 'Edit goal',
  'profil.goals_title_add': 'Add goal',
  'profil.goals_empty': 'No goals yet.',
  'profil.goals_reorder_hint': 'Goal order is set on Home via drag-drop.',
  'profil.goals_name_label': 'goal name',
  'profil.goals_name_placeholder': 'e.g. Emergency fund, Vacation',
  'profil.goals_target_label': 'target amount',

  'profil.wallets_title_list': 'Wallets',
  'profil.wallets_title_add': 'Add wallet',
  'profil.wallets_name_label': 'wallet name',
  'profil.wallets_balance_label': 'actual balance now',
  'profil.wallets_sesuaikan_btn': 'Adjust balance',
  'profil.wallets_delete_btn': 'Delete wallet',
  'profil.wallets_delete_confirm': 'Delete {name}?',
  'profil.wallets_diff_prefix': 'difference',
  'profil.wallets_diff_from': 'what caused the difference?',
  'profil.wallets_opt_lupa': 'Forgot to log — create a correction transaction',
  'profil.wallets_opt_transfer': 'Transfer to another wallet — 2 paired transactions',
  'profil.wallets_opt_koreksi': 'Just correct — update the number, no transaction',
  'profil.wallets_transfer_pick_label': 'pick target wallet',
  'profil.wallets_transfer_confirm': 'Confirm transfer',
  'profil.wallets_initial_balance': 'opening balance',
  'profil.wallets_add_btn': 'Add wallet',
  'profil.wallets_add_placeholder': 'e.g. Chase, Cash',
  'profil.wallets_add_more': '+ Add wallet',

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
  'profil.income_weekend_inconsistent': 'Inconsistent',
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
  'settings.row_secondary_currency': 'second currency',
  'settings.no_secondary_currency': 'none',
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
  'settings.currency_blocked_title': 'Currency still in use',
  'settings.currency_blocked_warning':
    'Remove all wallets, bills, and goals in this currency before disabling it.',
  'settings.import_error_title': 'Import failed',
  'settings.delete_title': 'Delete all data',
  'settings.delete_warning':
    'All transactions, wallets, bills, and goals will be permanently deleted. License is kept.',
  'settings.delete_next': 'Continue to delete',
  'settings.delete_type_prompt': 'Type DELETE to confirm',
  'settings.delete_type_word': 'DELETE',
  'settings.delete_type_placeholder': 'DELETE',
  'settings.delete_confirm_btn': 'Delete all data',
}

const strings: Record<Language, StringDictionary> = { id, en }

export function t(key: StringKey, lang: Language): string {
  return strings[lang][key] ?? strings.id[key]
}

export function toLocale(lang: Language): string {
  return lang === 'en' ? 'en-US' : 'id-ID'
}
