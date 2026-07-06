export default function AccountListShell({ children }) {
  return (
    <main className="accountListPage">
      <style>{css}</style>
      <section className="accountListShell">{children}</section>
    </main>
  );
}

const css = `
.accountListPage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:24px 22px 34px;
  animation:accountListDissolve .22s ease both;
  overflow-x:hidden;
}

.accountListShell{
  width:min(1340px, 100%);
  margin:0 auto;
  border-radius:22px;
  padding:28px 34px 30px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
  overflow:hidden;
}

.accountListState,
.accountListError{
  padding:28px 4px;
  border-top:1px solid rgba(0,0,0,.08);
  color:rgba(17,17,17,.52);
  font-size:14px;
  text-align:center;
}

.accountListError{
  margin-bottom:14px;
  border:0;
  border-radius:12px;
  background:rgba(215,38,61,.10);
  color:#b91c1c;
}

.accountListState.successState{
  margin-bottom:14px;
  border:0;
  border-radius:12px;
  background:rgba(34,197,94,.14);
  color:#15803d;
}

.accountList{
  border-top:1px solid rgba(0,0,0,.08);
  margin:0 -34px -30px;
  overflow:hidden;
}

.accountTableWrap{
  margin:0 -34px -30px;
  overflow-x:auto;
  border-top:1px solid rgba(0,0,0,.08);
  -webkit-overflow-scrolling:touch;
}

.accountListToolbar{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:14px;
  margin:-4px 0 16px;
}

.accountSegmentedFilter{
  --filter-count:2;
  --filter-index:0;
  position:relative;
  display:grid;
  grid-template-columns:repeat(var(--filter-count), minmax(126px, 1fr));
  gap:0;
  padding:4px;
  border-radius:999px;
  background:#eef1f4;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.04);
}

.accountSegmentedFilter::before{
  content:"";
  position:absolute;
  top:4px;
  bottom:4px;
  left:4px;
  width:calc((100% - 8px) / var(--filter-count));
  border-radius:999px;
  background:#050505;
  box-shadow:0 10px 22px rgba(0,0,0,.16);
  transform:translateX(calc(var(--filter-index) * 100%));
  transition:transform .22s ease;
}

.accountSegmentedFilter button{
  position:relative;
  z-index:1;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:30px;
  padding:0 13px;
  border:0;
  border-radius:999px;
  background:transparent;
  color:rgba(17,17,17,.68);
  font-family:inherit;
  font-size:13px;
  line-height:1;
  white-space:nowrap;
  cursor:pointer;
  transition:color .18s ease;
}

.accountSegmentedFilter button.active{
  color:#ffffff;
}

.accountTable{
  width:100%;
  min-width:0;
  border-collapse:collapse;
  table-layout:fixed;
}

.accountTable th{
  height:42px;
  padding:0 18px;
  background:#f0f1f2;
  color:rgba(17,17,17,.58);
  font-size:12px;
  line-height:1;
  font-weight:600;
  text-align:left;
  text-transform:uppercase;
}

.accountTable th.tableActionHeader{
  text-align:right;
}

.tableHeaderIcon{
  display:inline-flex;
  align-items:center;
  gap:6px;
}

.tableHeaderIcon img{
  width:13px;
  height:13px;
  object-fit:contain;
  flex:0 0 auto;
}

.accountTable td{
  padding:14px 18px;
  border-bottom:1px solid rgba(0,0,0,.08);
  color:#111111;
  font-size:13px;
  line-height:1.45;
  vertical-align:middle;
}

.accountTable td.tableActionCell{
  text-align:right;
}

.accountTable tbody tr:nth-child(even){
  background:#fafbfc;
}

.tablePerson,
.tableEvent{
  display:flex;
  align-items:center;
  gap:12px;
  min-width:0;
}

.tablePerson > div,
.tableEvent > div{
  min-width:0;
}

.tableThumb,
.tableAvatar{
  width:48px;
  height:48px;
  border-radius:50%;
  object-fit:cover;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  background:#ecebe7;
  color:#111111;
  font-size:15px;
  font-weight:500;
}

.tableThumb{
  width:44px;
  height:62px;
  border-radius:8px;
  object-fit:contain;
  background:#f3f5f8;
  border:1px solid rgba(0,0,0,.06);
}

.tableName{
  min-width:0;
  display:flex;
  align-items:center;
  gap:6px;
  color:#111111;
  font-size:14px;
  font-weight:500;
}

.tableName span{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.tableMeta{
  margin-top:3px;
  color:rgba(17,17,17,.52);
  font-size:12px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.tableStatusIcon{
  width:15px;
  height:15px;
  object-fit:contain;
  flex:0 0 auto;
}

.departmentCell{
  display:inline-flex;
  align-items:center;
  gap:7px;
  min-width:0;
}

.departmentCell img{
  width:15px;
  height:15px;
  object-fit:contain;
  flex:0 0 auto;
}

.tableTags{
  display:flex;
  flex-wrap:wrap;
  gap:5px;
}

.tableTags span{
  max-width:150px;
  padding:4px 8px;
  border-radius:7px;
  border:1px solid rgba(0,0,0,.08);
  background:#eef1f4;
  color:rgba(17,17,17,.64);
  font-size:12px;
  line-height:1.1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.tableLink{
  color:#244ee4;
  text-decoration:none;
  border-bottom:1px solid rgba(47,95,245,.24);
}

.tableLink:hover{
  color:#1f45cc;
  border-bottom-color:rgba(47,95,245,.42);
}

.tableMessage{
  max-width:none;
  overflow:visible;
  text-overflow:clip;
  white-space:normal;
  overflow-wrap:anywhere;
}

.tableActions{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:14px;
  flex-wrap:wrap;
  min-width:0;
}

.tableDash{
  color:rgba(17,17,17,.42);
}

.accountItem{
  display:grid;
  grid-template-columns:72px minmax(0, 1fr) auto;
  gap:16px;
  padding:20px 48px;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.accountItem:nth-child(even){
  background:#fafbfc;
}

.accountAvatar{
  width:62px;
  height:62px;
  border-radius:50%;
  object-fit:cover;
  display:grid;
  place-items:center;
  background:#ecebe7;
  color:#111111;
  font-size:18px;
  font-weight:500;
}

.accountBody{
  min-width:0;
}

.accountTitleRow{
  display:flex;
  align-items:center;
  gap:6px;
  min-width:0;
}

.accountTitleRow h2{
  min-width:0;
  margin:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#111111;
  font-size:16px;
  line-height:1.2;
  font-weight:500;
  letter-spacing:0;
}

.accountStatusIcon{
  width:16px;
  height:16px;
  object-fit:contain;
  flex:0 0 auto;
}

.accountMeta{
  margin:4px 0 0;
  color:rgba(17,17,17,.52);
  font-size:13px;
  line-height:1.35;
}

.accountRows{
  display:grid;
  gap:0;
  margin-top:10px;
}

.accountRow{
  display:grid;
  grid-template-columns:130px minmax(0, 1fr);
  gap:16px;
  padding:7px 0;
  border-bottom:1px solid rgba(0,0,0,.06);
  font-size:13px;
}

.accountLabel{
  color:rgba(17,17,17,.50);
}

.accountValue{
  min-width:0;
  color:#111111;
  line-height:1.55;
  overflow-wrap:anywhere;
}

.accountValue a{
  color:#244ee4;
  text-decoration:none;
  border-bottom:1px solid rgba(47,95,245,.24);
}

.accountValue a:hover{
  color:#1f45cc;
  border-bottom-color:rgba(47,95,245,.42);
}

.accountActions{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:10px;
}

.accountButton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  min-width:88px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-size:13px;
  line-height:1;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease;
}

.accountButton:hover{
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.accountButton:disabled{
  opacity:.68;
  cursor:not-allowed;
  transform:none;
}

.accountButton.accept{
  background:#e8f0fe;
  color:#315fa8;
}

.accountButton.reject{
  background:#fee8e8;
  color:#b42318;
}

.accountIconButton{
  width:36px;
  height:36px;
  display:inline-grid;
  place-items:center;
  padding:0;
  border:0;
  border-radius:999px;
  text-decoration:none;
  box-shadow:0 8px 18px rgba(0,0,0,.08);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.accountIconButton.labeled{
  width:auto;
  min-width:92px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:0 12px;
  color:#111111;
  font-family:inherit;
  font-size:13px;
  line-height:1;
}

.accountIconButton img{
  width:16px;
  height:16px;
  object-fit:contain;
}

.accountIconButton.view{
  background:#e8f0fe;
}

.accountIconButton.accept{
  background:#e8f0fe;
  color:#315fa8;
}

.accountIconButton.reject{
  background:#fee8e8;
  color:#b42318;
}

.accountIconButton:hover{
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.14);
}

.accountIconButton:disabled{
  opacity:.68;
  cursor:not-allowed;
  transform:none;
}

.accountPill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:22px;
  padding:0 9px;
  border-radius:999px;
  font-size:12px;
  white-space:nowrap;
}

.accountPill::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  flex:0 0 auto;
}

.accountPill.accepted{
  background:rgba(34,197,94,.16);
  color:#15803d;
  animation:accountPillGreen 1.8s ease-in-out infinite;
}

.accountPill.accepted::before{
  background:#22c55e;
}

.accountPill.rejected{
  background:rgba(215,38,61,.10);
  color:#b91c1c;
  animation:accountPillRed 1.8s ease-in-out infinite;
}

.accountPill.rejected::before{
  background:#d7263d;
}

.accountPill.pending{
  background:rgba(245,158,11,.14);
  color:#92400e;
  animation:accountPillYellow 1.8s ease-in-out infinite;
}

.accountPill.pending::before{
  background:#f59e0b;
}

.accountPill.ended{
  background:rgba(245,158,11,.14);
  color:#92400e;
  animation:accountPillYellow 1.8s ease-in-out infinite;
}

.accountPill.ended::before{
  background:#f59e0b;
}

.accountTags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.accountTags span{
  max-width:170px;
  min-width:0;
  padding:4px 9px;
  border-radius:7px;
  border:1px solid rgba(0,0,0,.08);
  background:#eef1f4;
  color:rgba(17,17,17,.64);
  font-size:12px;
  line-height:1.1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.accountMessage{
  margin-top:10px;
  color:#111111;
  font-size:13px;
  line-height:1.55;
  white-space:pre-wrap;
}

.endRequestBox{
  display:grid;
  justify-items:start;
  gap:9px;
  padding:12px;
  border-radius:10px;
  background:#fafbfc;
  border:1px solid rgba(0,0,0,.06);
}

.endRequestBox p{
  margin:0;
  color:#111111;
  font-size:13px;
  line-height:1.55;
  white-space:pre-wrap;
}

@keyframes accountListDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@keyframes accountPillGreen{
  0%, 100%{ box-shadow:0 6px 16px rgba(21,128,61,.10); }
  50%{ box-shadow:0 7px 22px rgba(21,128,61,.26); }
}

@keyframes accountPillRed{
  0%, 100%{ box-shadow:0 6px 16px rgba(185,28,28,.10); }
  50%{ box-shadow:0 7px 22px rgba(185,28,28,.24); }
}

@keyframes accountPillYellow{
  0%, 100%{ box-shadow:0 6px 16px rgba(146,64,14,.10); }
  50%{ box-shadow:0 7px 22px rgba(146,64,14,.22); }
}

@media (max-width:820px){
  .accountItem{
    grid-template-columns:60px minmax(0, 1fr);
  }

  .accountActions{
    grid-column:2;
    flex-direction:row;
    align-items:center;
    justify-content:flex-end;
    flex-wrap:wrap;
  }
}

@media (max-width:560px){
  .accountListPage{
    padding:10px 14px 36px;
  }

  .accountListShell{
    border-radius:18px;
    padding:20px 14px 24px;
  }

  .accountList{
    margin:0 -14px -24px;
  }

  .accountTableWrap{
    margin:0 -14px -24px;
  }

  .accountListToolbar{
    justify-content:flex-start;
    overflow-x:hidden;
  }

  .accountSegmentedFilter{
    width:100%;
    min-width:0;
    grid-template-columns:repeat(var(--filter-count), minmax(0, 1fr));
  }

  .accountSegmentedFilter button{
    padding:0 9px;
    font-size:12px;
  }

  .accountItem{
    grid-template-columns:54px minmax(0, 1fr);
    gap:11px;
    padding:16px 24px;
  }

  .accountAvatar{
    width:50px;
    height:50px;
    font-size:16px;
  }

  .accountRow{
    grid-template-columns:1fr;
    gap:5px;
  }
}
`;
