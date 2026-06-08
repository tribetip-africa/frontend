#!/usr/bin/env ruby
# frozen_string_literal: true

require "open3"

def git(*args)
  out, err, status = Open3.capture3("git", *args)
  raise "git #{args.join(' ')} failed: #{err}" unless status.success?

  out
end

def porcelain_files
  git("status", "--porcelain", "-uall").lines.filter_map do |line|
    line = line.chomp
    next if line.empty?

    status = line[0, 2].strip
    path = line[3..].strip.delete_prefix('"').delete_suffix('"')
    [status, path]
  end
end

def describe_path(path)
  case path
  when %r{\Asrc/app/}
    "Next.js route or layout"
  when %r{\Asrc/components/}
    "React component"
  when %r{\Asrc/lib/.*\.test\.(ts|tsx)\z}
    "unit test"
  when %r{\Asrc/lib/}
    "frontend library module"
  when %r{\Asrc/context/}
    "React context"
  when %r{\Asrc/hooks/}
    "React hook"
  when %r{\Ascripts/}
    "live test script"
  when %r{\Apackage\.json\z}
    "npm package manifest"
  when %r{\Anext\.config}
    "Next.js configuration"
  when %r{\Aeslint}
    "ESLint configuration"
  else
    "file"
  end
end

def extract_changes(diff)
  added = diff.lines.filter_map { |l| l[1..] if l.start_with?("+") && !l.start_with?("+++") }
  removed = diff.lines.filter_map { |l| l[1..] if l.start_with?("-") && !l.start_with?("---") }

  notes = []

  added.grep(/export function (\w+)/) { |l| notes << "Export #{l[/export function (\w+)/, 1]} component or helper." }
  added.grep(/export default function (\w+)/) { |l| notes << "Add default export #{l[/export default function (\w+)/, 1]}." }
  added.grep(/export type (\w+)/) { |l| notes << "Add #{l[/export type (\w+)/, 1]} type." }
  added.grep(/export async function (\w+)/) { |l| notes << "Add API helper #{l[/export async function (\w+)/, 1]}." }
  added.grep(/useEffect\(/).any? && notes << "Add client-side effect logic."
  added.grep(/useState\(/).any? && notes << "Add local UI state handling."
  added.grep(/useCallback\(/).any? && notes << "Memoize callback handlers."
  added.grep(/"use client"/).any? && notes << "Mark module as a client component."

  if added.any? { |l| l.include?("dashboard") }
    notes << "Extend dashboard navigation or page structure."
  end
  if added.any? { |l| l.include?("Paystack") || l.include?("paystack") }
    notes << "Improve Paystack onboarding or payout UX."
  end
  if added.any? { |l| l.include?("investigateAdminTip") || l.include?("TipInvestigation") }
    notes << "Add admin tip investigation UI and API wiring."
  end
  if added.any? { |l| l.include?("accountStatusBanner") || l.include?("profile") }
    notes << "Prefer fresh profile data over cached auth state for gating."
  end
  if added.any? { |l| l.include?("PayoutCard") }
    notes << "Add or refine payout card presentation."
  end
  if added.any? { |l| l.include?("confetti") }
    notes << "Add tip success celebration behavior."
  end
  if added.any? { |l| l.include?("hamburger") || l.include?("mobile") || l.include?("drawer") }
    notes << "Improve mobile dashboard navigation."
  end
  if added.any? { |l| l.include?("failed_reason") || l.include?("paid_via") }
    notes << "Surface payment audit metadata in the UI or types."
  end

  removed.grep(/export function (\w+)/) { |l| notes << "Remove #{l[/export function (\w+)/, 1]} export." }
  removed.grep(/export async function (\w+)/) { |l| notes << "Remove API helper #{l[/export async function (\w+)/, 1]}." }

  notes.uniq
end

def summarize_diff(path, diff, deleted: false)
  kind = describe_path(path)

  if deleted
    return "Remove #{path}.\n\nDelete this #{kind} and remove its usages from the frontend."
  end

  if diff.empty?
    return "Add #{path}.\n\nIntroduce a new #{kind} for the TribeTip frontend."
  end

  added = diff.lines.count { |l| l.start_with?("+") && !l.start_with?("+++") }
  removed = diff.lines.count { |l| l.start_with?("-") && !l.start_with?("---") }
  hunks = diff.lines.grep(/^@@ /).size

  lines = ["Update #{path}."]
  lines << ""
  lines << "Modify this #{kind} (#{hunks} edited section#{'s' if hunks != 1}, #{added} additions, #{removed} removals)."

  changes = extract_changes(diff)
  if changes.any?
    lines << ""
    lines << "What changed:"
    changes.first(12).each { |note| lines << "- #{note}" }
  else
    lines << ""
    lines << "What changed:"
    lines << "- Adjust UI, data flow, or tests in this #{kind}."
  end

  lines.join("\n")
end

files = porcelain_files
raise "No files to commit" if files.empty?

files.each do |status, path|
  if status == "D"
    git("rm", "-f", path)
    message = summarize_diff(path, "", deleted: true)
  else
    git("add", "--", path)
    diff = git("diff", "--cached", "--", path)
    message = summarize_diff(path, diff)
  end

  git("commit", "-m", message)
  puts "committed: #{path}"
end
