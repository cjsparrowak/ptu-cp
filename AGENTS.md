<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Use a data-driven curriculum module for all laboratory content so lessons and challenges stay separate from interface state.
- Keep learner progress client-local because the experience requires no account or shared data.
- Store tutor threads and messages in browser localStorage; only the AI response request runs server-side so learners need no account.
- Apply the saved light/dark preference on the root document before hydration so every route renders consistently without a theme flash.
