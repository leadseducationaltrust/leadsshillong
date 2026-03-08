(() => {
  const JOBS_ENDPOINT = 'jobs/jobs.json';
  const DEFAULT_CAREER_SCRIPT_URL = '';
  const latestList = document.getElementById('latest-openings-list');
  const allJobsList = document.getElementById('all-jobs-list');
  const listingsSection = document.getElementById('all-listings-section');
  const moreJobsLink = document.getElementById('more-jobs-link');
  const mainContent = document.getElementById('career-main-content');
  const footerContent = document.getElementById('career-footer');
  const modal = document.getElementById('job-modal');
  const closeModalBtn = document.getElementById('job-modal-close');
  const applicationPage = document.getElementById('application-page');
  const applicationCloseBtn = document.getElementById('application-page-close');
  const applicationCancelBtn = document.getElementById('application-cancel-btn');
  const applicationForm = document.getElementById('job-application-form');
  const applicationStatus = document.getElementById('application-status');
  const applicationSubmitBtn = document.getElementById('application-submit-btn');
  const scriptUrlMeta = document.querySelector('meta[name="career-script-url"]');

  const modalFields = {
    title: document.getElementById('job-modal-title'),
    code: document.getElementById('job-modal-code'),
    posted: document.getElementById('job-modal-posted'),
    deadline: document.getElementById('job-modal-deadline'),
    status: document.getElementById('job-modal-status'),
    department: document.getElementById('job-modal-department'),
    qualification: document.getElementById('job-modal-qualification'),
    experience: document.getElementById('job-modal-experience'),
    description: document.getElementById('job-modal-description')
  };

  const applyBtn = document.getElementById('job-apply-btn');
  const shareBtn = document.getElementById('job-share-btn');
  const applicationFields = {
    jobCode: document.getElementById('app-job-code'),
    jobTitle: document.getElementById('app-job-title')
  };

  let jobs = [];
  let selectedJob = null;

  function getCareerScriptUrl() {
    const configured = String(scriptUrlMeta?.content || '').trim();
    if (configured) {
      return configured;
    }

    return DEFAULT_CAREER_SCRIPT_URL;
  }

  function parseSafeDate(input) {
    const timestamp = Date.parse(String(input || '').trim());
    return Number.isNaN(timestamp) ? null : new Date(timestamp);
  }

  function isJobClosed(job) {
    const status = String(job.status || '').toLowerCase();
    const normalizedClosed = status === 'inactive' || status === 'closed';
    const deadlineDate = parseSafeDate(job.deadline);
    const now = new Date();

    if (!deadlineDate) {
      return normalizedClosed;
    }

    deadlineDate.setHours(23, 59, 59, 999);
    return normalizedClosed || deadlineDate < now;
  }

  function formatDate(input) {
    const parsed = parseSafeDate(input);
    if (!parsed) return 'N/A';

    return parsed.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusPriority(status) {
    const normalized = String(status || '').trim().toLowerCase();
    return normalized === 'active' ? 0 : 1;
  }

  function sortByStatusThenDatePostedDesc(items) {
    return [...items].sort((left, right) => {
      const leftStatus = getStatusPriority(left.status);
      const rightStatus = getStatusPriority(right.status);

      if (leftStatus !== rightStatus) {
        return leftStatus - rightStatus;
      }

      const leftTs = parseSafeDate(left.date_posted)?.getTime() || 0;
      const rightTs = parseSafeDate(right.date_posted)?.getTime() || 0;
      return rightTs - leftTs;
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getStatusBadge(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active') {
      return '<span class="text-[10px] uppercase tracking-wide font-bold border rounded-full px-2 py-0.5 job-status-active">Active</span>';
    }

    return '<span class="text-[10px] uppercase tracking-wide font-bold border rounded-full px-2 py-0.5 job-status-inactive">Inactive</span>';
  }

  function createJobCard(job, compact) {
    const wrapper = document.createElement('button');
    wrapper.type = 'button';
    wrapper.className = 'job-item text-left w-full bg-white';

    const code = escapeHtml(job.job_code || 'N/A');
    const title = escapeHtml(job.title || 'Untitled Job');
    const department = escapeHtml(job.department || 'N/A');
    const description = escapeHtml(job.description || 'No description provided.');
    const posted = escapeHtml(formatDate(job.date_posted));
    const deadline = escapeHtml(formatDate(job.deadline));

    wrapper.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] text-slate-500 font-semibold tracking-wide">${code}</p>
          <h3 class="text-base font-black text-blue-900 leading-snug mt-1">${title}</h3>
          <p class="text-xs text-slate-500 mt-1">${department}</p>
        </div>
        ${getStatusBadge(job.status)}
      </div>
      <div class="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600 font-semibold">
        <span class="job-pill rounded-full px-2 py-0.5">Posted: ${posted}</span>
        <span class="job-pill rounded-full px-2 py-0.5">Deadline: ${deadline}</span>
      </div>
      ${compact ? '' : `<p class="text-sm text-slate-600 mt-3 line-clamp-2">${description}</p>`}
    `;

    wrapper.addEventListener('click', () => openJobModal(job));
    return wrapper;
  }

  function renderJobs() {
    if (!latestList || !allJobsList) {
      return;
    }

    latestList.innerHTML = '';
    allJobsList.innerHTML = '';

    const sorted = sortByStatusThenDatePostedDesc(jobs);
    const latestThree = sorted.slice(0, 3);

    latestThree.forEach((job) => {
      latestList.appendChild(createJobCard(job, true));
    });

    sorted.forEach((job) => {
      allJobsList.appendChild(createJobCard(job, false));
    });
  }

  function updateApplyButtonState(job) {
    const shouldDisable = isJobClosed(job);
    applyBtn.classList.remove('btn-disabled');
    applyBtn.removeAttribute('aria-disabled');
    applyBtn.textContent = 'Apply Now';

    if (shouldDisable) {
      applyBtn.classList.add('btn-disabled');
      applyBtn.setAttribute('aria-disabled', 'true');
      applyBtn.textContent = 'Applications Closed';
    }
  }

  function openJobModal(job) {
    selectedJob = job;

    modalFields.title.textContent = job.title || 'Untitled Job';
    modalFields.code.textContent = job.job_code || 'N/A';
    modalFields.posted.textContent = formatDate(job.date_posted);
    modalFields.deadline.textContent = formatDate(job.deadline);
    modalFields.status.textContent = String(job.status || 'N/A').toUpperCase();
    modalFields.department.textContent = job.department || 'N/A';
    modalFields.qualification.textContent = job.qualification || 'N/A';
    modalFields.experience.textContent = job.experience || 'N/A';
    modalFields.description.textContent = job.description || 'No description provided.';

    updateApplyButtonState(job);

    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');

    const url = new URL(window.location.href);
    url.searchParams.set('job', job.job_code);
    window.history.replaceState({}, '', url);
  }

  function closeJobModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');

    const url = new URL(window.location.href);
    url.searchParams.delete('job');
    window.history.replaceState({}, '', url);
  }

  function setApplicationStatus(type, message) {
    if (!applicationStatus) return;

    const styleMap = {
      info: 'bg-blue-50 border border-blue-200 text-blue-800',
      success: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
      error: 'bg-red-50 border border-red-200 text-red-700'
    };

    applicationStatus.className = `text-sm rounded-lg px-3 py-2 ${styleMap[type] || styleMap.info}`;
    applicationStatus.textContent = message;
    applicationStatus.classList.remove('hidden');
  }

  function clearApplicationStatus() {
    if (!applicationStatus) return;
    applicationStatus.classList.add('hidden');
    applicationStatus.textContent = '';
  }

  function openApplicationPage() {
    if (!selectedJob || !applicationPage || !applicationForm) {
      return;
    }

    applicationFields.jobCode.value = selectedJob.job_code || '';
    applicationFields.jobTitle.value = selectedJob.title || '';
    clearApplicationStatus();

    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      closeJobModal();
    }

    if (mainContent) {
      mainContent.classList.add('hidden');
    }
    if (footerContent) {
      footerContent.classList.add('hidden');
    }

    applicationPage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeApplicationPage() {
    if (!applicationPage) return;

    applicationPage.classList.add('hidden');

    if (mainContent) {
      mainContent.classList.remove('hidden');
    }
    if (footerContent) {
      footerContent.classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function shareSelectedJob() {
    if (!selectedJob) return;

    const shareLink = `${window.location.origin}${window.location.pathname}?job=${encodeURIComponent(selectedJob.job_code)}`;
    const shareText = `${selectedJob.title} (${selectedJob.job_code}) at LEADS Higher Secondary School`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedJob.title,
          text: shareText,
          url: shareLink
        });
        return;
      } catch (_error) {
        // Fall back to copy-to-clipboard when share is canceled or fails.
      }
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      shareBtn.textContent = 'Link Copied';
      setTimeout(() => {
        shareBtn.textContent = 'Share';
      }, 1400);
    } catch (_error) {
      shareBtn.textContent = 'Copy Failed';
      setTimeout(() => {
        shareBtn.textContent = 'Share';
      }, 1400);
    }
  }

  function handleApplyClick() {
    if (!selectedJob || isJobClosed(selectedJob)) {
      return;
    }

    openApplicationPage();
  }

  function validateResumeFile(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const maxSize = 5 * 1024 * 1024;

    if (!file) {
      return 'Please attach your resume.';
    }

    const lowerName = String(file.name || '').toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = allowedTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMime) {
      return 'Resume must be a PDF, DOC, or DOCX file.';
    }

    if (file.size > maxSize) {
      return 'Resume exceeds 5MB. Please upload a smaller file.';
    }

    return null;
  }

  function fileToBase64(file, baseName) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const extension = String(file.name || '').split('.').pop();
        const resolvedName = extension ? `${baseName}.${extension}` : baseName;
        resolve({
          name: resolvedName,
          type: file.type,
          data: String(reader.result || '').split(',')[1] || ''
        });
      };
      reader.onerror = () => reject(new Error('Unable to read resume file.'));
    });
  }

  async function handleApplicationSubmit(event) {
    event.preventDefault();
    clearApplicationStatus();

    if (!selectedJob) {
      setApplicationStatus('error', 'Please select a job before applying.');
      return;
    }

    if (isJobClosed(selectedJob)) {
      setApplicationStatus('error', 'Applications for this role are closed.');
      return;
    }

    const formData = new FormData(applicationForm);
    const resume = formData.get('resume');
    const resumeValidationError = validateResumeFile(resume);
    if (resumeValidationError) {
      setApplicationStatus('error', resumeValidationError);
      return;
    }

    const endpoint = getCareerScriptUrl();
    if (!endpoint) {
      setApplicationStatus('error', 'Career script URL is not configured yet.');
      return;
    }

    applicationSubmitBtn.disabled = true;
    setApplicationStatus('info', 'Submitting your application...');

    try {
      const formFields = Object.fromEntries(formData.entries());
      delete formFields.resume;

      const applicantBaseName = `${String(formFields.first_name || 'Applicant').trim()}_${String(formFields.last_name || '').trim()}`
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/^_+|_+$/g, '') || 'Applicant';

      const requestPayload = {
        ...formFields,
        job_code: selectedJob.job_code || '',
        job_title: selectedJob.title || '',
        department: selectedJob.department || '',
        files: {
          resume: await fileToBase64(resume, `${applicantBaseName}_${selectedJob.job_code || 'JOB'}_Resume`)
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      });

      const responsePayload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responsePayload.message || responsePayload.error || 'Unable to submit application at this time.');
      }

      const isSuccess = responsePayload.ok === true || responsePayload.status === 'success';
      if (!isSuccess) {
        throw new Error(responsePayload.message || responsePayload.error || 'Unable to submit application at this time.');
      }

      const applicationId = responsePayload.application_id ? ` (ID: ${responsePayload.application_id})` : '';
      setApplicationStatus('success', `Application submitted successfully${applicationId}.`);
      applicationForm.reset();
      applicationFields.jobCode.value = selectedJob.job_code || '';
      applicationFields.jobTitle.value = selectedJob.title || '';

      // Briefly show success state, then return users to the main career page.
      window.setTimeout(() => {
        window.location.href = 'career.html';
      }, 3000);
    } catch (error) {
      setApplicationStatus('error', error.message || 'Unable to submit application at this time.');
    } finally {
      applicationSubmitBtn.disabled = false;
    }
  }

  async function loadJobs() {
    try {
      const response = await fetch(JOBS_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const parsed = await response.json();
      if (Array.isArray(parsed)) {
        jobs = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
        jobs = parsed.items;
      } else {
        jobs = [];
      }
      renderJobs();

      const targetCode = new URL(window.location.href).searchParams.get('job');
      if (targetCode) {
        const matching = jobs.find((job) => String(job.job_code) === String(targetCode));
        if (matching) {
          openJobModal(matching);
        }
      }
    } catch (error) {
      latestList.innerHTML = '<p class="text-sm text-red-700">Unable to load jobs right now. Please check back soon.</p>';
      allJobsList.innerHTML = '<p class="text-sm text-red-700">Unable to load jobs right now. Please check back soon.</p>';
      console.error('Failed to load jobs:', error);
    }
  }

  if (moreJobsLink && listingsSection) {
    moreJobsLink.addEventListener('click', (event) => {
      event.preventDefault();
      listingsSection.classList.remove('hidden');
      listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeJobModal);
  }

  if (applicationCloseBtn) {
    applicationCloseBtn.addEventListener('click', closeApplicationPage);
  }

  if (applicationCancelBtn) {
    applicationCancelBtn.addEventListener('click', closeApplicationPage);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeJobModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeJobModal();
    }
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', handleApplyClick);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', shareSelectedJob);
  }

  if (applicationForm) {
    applicationForm.addEventListener('submit', handleApplicationSubmit);
  }

  loadJobs();
})();
