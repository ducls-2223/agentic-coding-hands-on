-- Add department to recipients so the highlight carousel can filter by department.
-- Nullable: pre-existing rows without a department keep working; seed re-run
-- populates the 8 demo rows.

alter table public.kudos_recipients
  add column if not exists department text;

create index if not exists kudos_recipients_department_idx
  on public.kudos_recipients (department);
