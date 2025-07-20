import { NavLink } from 'react-router-dom';
import classes from './PolicyPage.module.css';

const PolicyPage = () => (
  <div className={classes.container}>
    <h1 className={'font-bold text-2xl'}>Listener-Driven Micro-Donations: Privacy Policy</h1>
    <br />
    <br />
    <p className={'italic text-sm'}>
      This is an academic research prototype for "Listener-Driven Micro-Donations in Music Streaming: A System Design and Evaluation"
      presented as part of a university diploma project. This privacy policy describes how we collect and use data for research purposes only.
    </p>
    <br />
    <span>
      This privacy notice for the Listener-Driven Micro-Donations research project ("we," "us," or "our"), describes how and why we might collect, store, use,
      and/or share ("process") your information when you participate in our research study ("Research"), such as when you:
    </span>
    <ul className={'pl-10'}>
      <li>
        Participate in our research study through the prototype application
      </li>
      <li>Connect your Spotify account to provide listening data for research analysis</li>
      <li>Interact with the micro-donation allocation system for research purposes</li>
      <li>Provide feedback or participate in research surveys</li>
    </ul>
    <span>
      <strong>Questions or concerns?</strong> Reading this privacy notice will help you understand your privacy rights
      and choices as a research participant. If you do not agree with our policies and practices, please do not participate
      in this research study. If you still have any questions or concerns, please contact the research team at the university.
    </span>
    <br />
    <br />
    <h2 className={'text-[22px]'}>SUMMARY OF KEY POINTS</h2>
    <br />
    <p className={'font-bold'}>
      This summary provides key points from our privacy notice, but you can find out more details about any of these
      topics by clicking the link following each key point or by using our{' '}
      <a className={'text-primary font-normal'} href="#table">
        table of contents
      </a>{' '}
      below to find the section you are looking for.
    </p>{' '}
    <br />
    <p>
      <strong> What personal information do we process?</strong> When you visit, use, or navigate our Services, we may
      process personal information depending on how you interact with us and the Services, the choices you make, and the
      products and features you use. Learn more about <a href="#personal"> personal information you disclose to us.</a>
    </p>
    <br />
    <p>
      <strong> How do we use your Spotify data?</strong> With your permission, we collect information about your Spotify
      listening activity to analyze how micro-donations could be distributed among the artists you listen to. We
      use a "LISTEN-TIME-FACTOR" that represents the proportion of time you've spent listening to each artist for research purposes. Learn
      more about
      <a href="#spotify-data"> how we use your Spotify data.</a>
    </p>
    <br />
    <p>
      <strong> Do we process any sensitive personal information?</strong> We do not process sensitive personal
      information.
    </p>{' '}
    <br />
    <p>
      <strong> Do we receive any information from third parties?</strong> We receive information from Spotify when you
      connect your Spotify account to our research prototype.
    </p>
    <br />
    <p>
      <strong> How do we process your information?</strong> We process your information to conduct academic research on
      listener-driven micro-donations, analyze listening patterns, evaluate system effectiveness, communicate with you about
      the research, and ensure research integrity. We process your information only when we have a valid legal reason to do so
      and in accordance with university research ethics guidelines. Learn more about{' '}
      <a href="#section2"> how we process your information.</a>
    </p>
    <br />
    <p>
      <strong>In what situations and with which parties do we share personal information?</strong> We may share
      anonymized, aggregated information in academic publications and presentations. We do not share individual personal
      information with third parties except as required by law or university research ethics guidelines. Learn more about{' '}
      <a href="#section4"> when and with whom we share your personal information.</a>
    </p>{' '}
    <br />
    <p>
      <strong>How do we keep your information safe?</strong> We have organizational and technical processes and
      procedures in place to protect your personal information. However, no electronic transmission over the internet or
      information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that
      hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and
      improperly collect, access, steal, or modify your information. Learn more about{' '}
      <a href="#section8">how we keep your information safe.</a>
    </p>
    <br />
    <p>
      <strong>What are your rights?</strong> As a research participant, you have specific rights regarding your personal
      information, including the right to withdraw from the study, access your data, and request deletion. Learn more about{' '}
      <a href="#section10">your privacy rights.</a>
    </p>
    <br />
    <p>
      <strong>How do you exercise your rights? </strong>You can exercise your rights as a research participant by contacting
      the research team directly. We will consider and act upon any request in accordance with university research ethics
      guidelines and applicable data protection laws.
    </p>
    <br />
    <p>
      Want to learn more about what we do with any information we collect for this research study?
      <a href="#table"> Review the privacy notice in full.</a>
    </p>
    <br />
    <h2 className={'text-[20px]'} id="table">
      TABLE OF CONTENTS
    </h2>
    <br />
    <ol className={'gap-1 flex-col flex'}>
      <li>
        <a href="#section1">1. WHAT INFORMATION DO WE COLLECT?</a>
      </li>
      <li>
        <a href="#section2">2. HOW DO WE PROCESS YOUR INFORMATION?</a>
      </li>
      <li>
        <a href="#section3">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a>
      </li>
      <li>
        <a href="#section4">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a>
      </li>
      <li>
        <a href="#section5">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a>
      </li>
      <li>
        <a href="#section6">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a>
      </li>
      <li>
        <a href="#section7">7. HOW LONG DO WE KEEP YOUR INFORMATION?</a>
      </li>
      <li>
        <a href="#section8">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</a>
      </li>
      <li>
        <a href="#section9">9. DO WE COLLECT INFORMATION FROM MINORS?</a>
      </li>
      <li>
        <a href="#section10">10. WHAT ARE YOUR PRIVACY RIGHTS?</a>
      </li>
      <li>
        <a href="#section11">11. CONTROLS FOR DO-NOT-TRACK FEATURES</a>
      </li>
      <li>
        <a href="#section12">12. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a>
      </li>
      <li>
        <a href="#section13">13. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</a>
      </li>
      <li>
        <a href="#section14">14. DO WE MAKE UPDATES TO THIS NOTICE?</a>
      </li>
      <li>
        <a href="#section15">15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a>
      </li>
      <li>
        <a href="#section16">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a>
      </li>
      <li>
        <a href="#section17">17. FEES AND PAYMENTS</a>
      </li>
      <li>
        <a href="#section18">18. CONTRIBUTIONS AND DATA OWNERSHIP</a>
      </li>
      <li>
        <a href="#section19">19. AUTOMATED DECISION MAKING AND PROFILING</a>
      </li>
      <li>
        <a href="#section20">20. DATA BREACH NOTIFICATION</a>
      </li>
      <li>
        <a href="#section21">21. INTERNATIONAL DATA TRANSFERS</a>
      </li>
      <li>
        <a href="#section22">22. COOKIES AND TRACKING</a>
      </li>
      <li>
        <a href="#section23">23. DATA CONTROLLER STATUS</a>
      </li>
      <li>
        <a href="#section24">24. MINOR PROTECTION</a>
      </li>
    </ol>
    <br />
    <br />
    <h2 id="section1">1. WHAT INFORMATION DO WE COLLECT?</h2>
    <br />
    <h3 id="personal">Personal information you disclose to us</h3>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong> We collect personal information that you provide to us.
    </p>
    <br />
    <p>
      We collect personal information that you voluntarily provide to us when you register on the Services, express an
      interest in obtaining information about us or our products and Services, when you participate in activities on the
      Services, or otherwise when you contact us.
    </p>
    <br />
    <p>
      <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the
      context of your interactions with us and the Services, the choices you make, and the products and features you
      use. The personal information we collect may include the following:
    </p>
    <ul className={'pl-10'}>
      <li>email addresses</li>
      <li>usernames</li>
      <li>payment information</li>
      <li>billing information</li>
    </ul>
    <p>
      <strong>Sensitive Information.</strong> We do not process sensitive information.
    </p>
    <br />
    <p>
      <strong>Payment Data</strong>We may collect data necessary to process your payment if you choose to make
      purchases, such as your payment instrument number, and the security code associated with your payment instrument.
      All payment data is handled and stored by Stripe. You may find their privacy notice link(s) here:
      <NavLink target="_blank" to="https://stripe.com/en-nl/privacy.">
        {' '}
        https://stripe.com/en-nl/privacy.
      </NavLink>
    </p>
    <br />
    <p>
      <strong>Social Media Login Data.</strong>We may provide you with the option to register with us using your
      existing social media account details, like your Facebook, X, or other social media account. If you choose to
      register in this way, we will collect certain profile information about you from the social media provider, as
      described in the section called "<a href="#section6">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a>" below.
    </p>
    <br />
    <p>
      All personal information that you provide to us must be true, complete, and accurate, and you must notify us of
      any changes to such personal information.
    </p>
    <br />
    <h3>Information automatically collected</h3>
    <br />
    <p className={'italic'}>
      <strong> In Short:</strong>Some information — such as your Internet Protocol (IP) address and/or browser and
      device characteristics — is collected automatically when you visit our Services.
    </p>
    <br />
    <p>
      We automatically collect certain information when you visit, use, or navigate the Services. This information does
      not reveal your specific identity (like your name or contact information) but may include device and usage
      information, such as your IP address, browser and device characteristics, operating system, language preferences,
      referring URLs, device name, country, location, information about how and when you use our Services, and other
      technical information. This information is primarily needed to maintain the security and operation of our
      Services, and for our internal analytics and reporting purposes.
    </p>
    <br />
    <p>Like many businesses, we also collect information through cookies and similar technologies.</p>
    <br />
    <span> The information we collect includes:</span>
    <ul className={'ml-10'}>
      <li>
        <span className={'italic'}>Log and Usage Data.</span> Log and usage data is service-related, diagnostic, usage,
        and performance information our servers automatically collect when you access or use our Services and which we
        record in log files. Depending on how you interact with us, this log data may include your IP address, device
        information, browser type, and settings and information about your activity in the Services (such as the
        date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such
        as which features you use), device event information (such as system activity, error reports (sometimes called
        "crash dumps"), and hardware settings).
      </li>
      <li>
        <span className={'italic'}>Device Data.</span>
        We collect device data such as information about your computer, phone, tablet, or other device you use to access
        the Services. Depending on the device used, this device data may include information such as your IP address (or
        proxy server), device and application identification numbers, location, browser type, hardware model, Internet
        service provider and/or mobile carrier, operating system, and system configuration information.
      </li>
      <li>
        <span className={'italic'}>Location Data.</span>
        We collect location data such as information about your device's location, which can be either precise or
        imprecise. How much information we collect depends on the type and settings of the device you use to access the
        Services. For example, we may use GPS and other technologies to collect geolocation data that tells us your
        current location (based on your IP address). You can opt out of allowing us to collect this information either
        by refusing access to the information or by disabling your Location setting on your device. However, if you
        choose to opt out, you may not be able to use certain aspects of the Services.
      </li>
    </ul>
    <br />
    <h3 id="spotify-data">Information from your Spotify account</h3>
    <br />
    <p>
      When you connect your Spotify account to our Services, we collect information about your listening activity. This
      includes:
    </p>
    <ul className={'pl-10'}>
      <li>Artists you listen to</li>
      <li>Duration of time spent listening to each artist</li>
      <li>Timestamps of listening sessions</li>
      <li>Recently played tracks</li>
    </ul>
    <br />
    <p>
      This information is essential for our core service - calculating the "LISTEN-TIME-FACTOR" that determines how your
      monthly contribution is distributed among the artists you listen to. The LISTEN-TIME-FACTOR represents the
      proportion of time you've spent listening to each artist compared to your total listening time.
    </p>
    <br />
    <h2 id="section2">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong> We process your information to provide, improve, and administer our Services,
      communicate with you, for security and fraud prevention, and to comply with law. We may also process your
      information for other purposes with your consent.
    </p>
    <br />
    <span>
      <strong>
        We process your personal information for a variety of reasons, depending on how you interact with our Services,
        including:
      </strong>
    </span>
    <ul className={'pl-10'}>
      <li>
        <span>
          <strong> To facilitate account creation and authentication and otherwise manage user accounts.</strong> We may
          process your information so you can create and log in to your account, as well as keep your account in working
          order.
        </span>
      </li>
      <li>
        <span>
          <strong> To process payments and distribute funds to artists.</strong> We process your payment information and
          Spotify listening data to calculate and facilitate the distribution of your contributions to artists based on
          your listening activity.
        </span>
      </li>
      <li>
        <span>
          <strong> To provide you with usage statistics and insights.</strong> We may process your information to
          generate reports about your listening habits and how your contributions are distributed.
        </span>
      </li>
      <li>
        <span>
          <strong> To save or protect an individual's vital interest. </strong> We may process your information when
          necessary to save or protect an individual's vital interest, such as to prevent harm.
        </span>
      </li>
    </ul>
    <br />
    <h2 id="section3">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a
      valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws,
      to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to
      fulfill our legitimate business interests.
    </p>
    <br />
    <p>
      <strong className={'underline'}>If you are located in the EU or UK, this section applies to you.</strong>
    </p>
    <br />
    <span>
      The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on
      in order to process your personal information:
    </span>
    <br />
    <ul className={'pl-10'}>
      <li>
        <span>
          <strong>Consent.</strong> We may process your information if you have given us permission (i.e., consent) to
          use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more
          about
        </span>{' '}
        <a href="#withdraw">withdrawing your consent.</a>
      </li>
      <li>
        <strong>Legal Obligations. </strong>
        <span>
          We may process your information where we believe it is necessary for compliance with our legal obligations,
          such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or
          disclose your information as evidence in litigation in which we are involved.
        </span>
      </li>
      <li>
        <strong>Vital Interests.</strong>
        <span>
          We may process your information where we believe it is necessary to protect your vital interests or the vital
          interests of a third party, such as situations involving potential threats to the safety of any person.
        </span>
      </li>
    </ul>
    <br />
    <p>
      In legal terms, we are generally the "data controller" under European data protection laws of the personal
      information described in this privacy notice, since we determine the means and/or purposes of the data processing
      we perform. This privacy notice does not apply to the personal information we process as a "data processor" on
      behalf of our customers. In those situations, the customer that we provide services to and with whom we have
      entered into a data processing agreement is the "data controller" responsible for your personal information, and
      we merely process your information on their behalf in accordance with your instructions. If you want to know more
      about our customers' privacy practices, you should read their privacy policies and direct any questions you have
      to them.
    </p>
    <br />
    <p className={'underline font-bold'}>If you are located in Canada, this section applies to you.</p>
    <br />
    <p>
      We may process your information if you have given us specific permission (i.e., express consent) to use your
      personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied
      consent). You can <a href="#withdraw">withdraw your consent</a> at any time.
    </p>
    <br />
    <span>
      In some exceptional cases, we may be legally permitted under applicable law to process your information without
      your consent, including, for example:
    </span>
    <br />
    <ul className={'pl-10'}>
      <li>
        If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way.
      </li>
      <li>For investigations and fraud detection and prevention.</li>
      <li>For business transactions provided certain conditions are met.</li>
      <li>
        If it is contained in a witness statement and the collection is necessary to assess, process, or settle an
        insurance claim.
      </li>
      <li>For identifying injured, ill, or deceased persons and communicating with next of kin.</li>
      <li>
        If we have reasonable grounds to believe an individual has been, is, or may be a victim of financial abuse.
      </li>
      <li>
        If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy
        of the information and the collection is reasonable for purposes related to investigating a breach of an
        agreement or a contravention of the laws of Canada or a province.
      </li>
      <li>
        If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the
        production of records.
      </li>
      <li>
        If it was produced by an individual in the course of their employment, business, or profession and the
        collection is consistent with the purposes for which the information was produced.
      </li>
      <li>If the collection is solely for journalistic, artistic, or literary purposes.</li>
      <li>If the information is publicly available and is specified by the regulations.</li>
    </ul>
    <br />
    <h2 id="section4">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>We may share information in specific situations described in this section and/or with
      the following third parties.
    </p>
    <br />
    <span>We may need to share your personal information in the following situations:</span>
    <br />
    <ul className={'pl-10'}>
      <li>
        <span>
          <strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during
          negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our
          business to another company.
        </span>
      </li>
    </ul>
    <br />
    <h2 id="section5">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>We may use cookies and other tracking technologies to collect and store your
      information.
    </p>
    <br />
    <p>
      We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you
      interact with our Services. Some online tracking technologies help us maintain the security of our Services and
      your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
    </p>
    <br />
    <p>
      We also permit third parties and service providers to use online tracking technologies on our Services for
      analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your
      interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third
      parties and service providers use their technology to provide advertising about products and services tailored to
      your interests which may appear either on our Services or on other websites.
    </p>
    <p>
      To the extent these online tracking technologies are deemed to be a "sale"/"sharing" (which includes targeted
      advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online
      tracking technologies by submitting a request as described below under section
      <a href="#section12">"DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?"</a>
    </p>
    <br />
    <p>
      Specific information about how we use such technologies and how you can refuse certain cookies is set out in our
      Cookie Notice.
    </p>
    <br />
    <h3>Google Analytics</h3>
    <br />
    <p>
      We may share your information with Google Analytics to track and analyze the use of the Services. The Google
      Analytics Advertising Features that we may use include: Google Analytics Demographics and Interests Reporting. To
      opt out of being tracked by Google Analytics across the Services, visit https://tools.google.com/dlpage/gaoptout.
      You can opt out of Google Analytics Advertising Features through{' '}
      <NavLink target="_blank" to="https://adssettings.google.com/">
        Ads Settings{' '}
      </NavLink>
      and Ad Settings for mobile apps. Other opt out means include
      <NavLink to="http://optout.networkadvertising.org/">http://optout.networkadvertising.org/</NavLink> and
      <NavLink target="_blank" to="http://www.networkadvertising.org/mobile-choice">
        http://www.networkadvertising.org/mobile-choice.
      </NavLink>
      For more information on the privacy practices of Google, please visit the
      <NavLink target="_blank" to="https://policies.google.com/privacy">
        Google Privacy & Terms page.
      </NavLink>
    </p>
    <br />
    <h2 id="section6">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>If you choose to register or log in to our Services using a social media account, we may
      have access to certain information about you.
    </p>
    <br />
    <p>
      Our Services offer you the ability to register and log in using your third-party social media account details
      (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about
      you from your social media provider. The profile information we receive may vary depending on the social media
      provider concerned, but will often include your name, email address, friends list, and profile picture, as well as
      other information you choose to make public on such a social media platform.
    </p>
    <br />
    <p>
      We will use the information we receive only for the purposes that are described in this privacy notice or that are
      otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible
      for, other uses of your personal information by your third-party social media provider. We recommend that you
      review their privacy notice to understand how they collect, use, and share your personal information, and how you
      can set your privacy preferences on their sites and apps.
    </p>
    <br />
    <h2 id="section7">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>We keep your information for as long as necessary to fulfill the purposes outlined in
      this privacy notice unless otherwise required by law.
    </p>
    <br />
    <p>
      We will only keep your personal information for as long as it is necessary for the purposes set out in this
      privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or
      other legal requirements). No purpose in this notice will require us keeping your personal information for longer
      than the period of time in which users have an account with us.
    </p>
    <br />
    <p>
      When we have no ongoing legitimate business need to process your personal information, we will either delete or
      anonymize such information, or, if this is not possible (for example, because your personal information has been
      stored in backup archives), then we will securely store your personal information and isolate it from any further
      processing until deletion is possible.
    </p>
    <br />
    <h2 id="section8">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>We aim to protect your personal information through a system of organizational and
      technical security measures.
    </p>
    <br />
    <p>
      We have implemented appropriate and reasonable technical and organizational security measures designed to protect
      the security of any personal information we process. However, despite our safeguards and efforts to secure your
      information, no electronic transmission over the Internet or information storage technology can be guaranteed to
      be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third
      parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
      Although we will do our best to protect your personal information, transmission of personal information to and
      from our Services is at your own risk. You should only access the Services within a secure environment.
    </p>
    <br />
    <h2 id="section9">9. DO WE COLLECT INFORMATION FROM MINORS?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>We do not knowingly collect data from or market to children under 18 years of age.
    </p>
    <br />
    <p>
      We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly
      sell such personal information. By using the Services, you represent that you are at least 18 or that you are the
      parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that
      personal information from users less than 18 years of age has been collected, we will deactivate the account and
      take reasonable measures to promptly delete such data from our records. If you become aware of any data we may
      have collected from children under age 18, please contact us at javor@mypie.app.
    </p>
    <br />
    <h2 id="section10">10. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>Depending on your state of residence in the US or in some regions, such as the European
      Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access
      to and control over your personal information. You may review, change, or terminate your account at any time,
      depending on your country, province, or state of residence.
    </p>
    <br />
    <p>
      In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data
      protection laws. These may include the right (i) to request access and obtain a copy of your personal information,
      (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if
      applicable, to data portability; and (v) not to be subject to automated decision-making. In certain circumstances,
      you may also have the right to object to the processing of your personal information. You can make such a request
      by contacting us by using the contact details provided in the section{' '}
      <a href="#section15">"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"</a>
      below.
    </p>
    <br />
    <p>We will consider and act upon any request in accordance with applicable data protection laws.</p>
    <br />
    <p>
      If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you
      also have the right to complain to your
      <NavLink target="_blank" to="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm">
        {' '}
        State data protection authority
      </NavLink>{' '}
      or{' '}
      <NavLink
        target="_blank"
        to="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/"
      >
        UK data protection authority
      </NavLink>
    </p>
    <br />
    <p>
      If you are located in Switzerland, you may contact the
      <NavLink target="_blank" to="https://www.edoeb.admin.ch/edoeb/en/home.html">
        {' '}
        Federal Data Protection and Information Commissioner
      </NavLink>
    </p>
    <br />
    <p>
      <span className={'underline font-bold'} id="withdraw">
        Withdrawing your consent:
      </span>{' '}
      If we are relying on your consent to process your personal information, which may be express and/or implied
      consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw
      your consent at any time by contacting us by using the contact details provided in the section{' '}
      <a href="#section15">"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"</a>
      below or updating your preferences.
    </p>
    <br />
    <p>
      However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when
      applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful
      processing grounds other than consent.
    </p>
    <br />
    <h3>Account Information</h3>
    <br />
    <p>
      If you would at any time like to review or change the information in your account or terminate your account, you
      can:
    </p>
    <br />
    <ul className={'pl-10'}>
      <li>Log in to your account settings and update your user account.</li>
    </ul>
    <br />
    <p>
      Upon your request to terminate your account, we will deactivate or delete your account and information from our
      active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems,
      assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
    </p>
    <br />
    <p>
      <span className={'underline font-bold'}>Cookies and similar technologies: </span>
      Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser
      to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect
      certain features or services of our Services.
    </p>
    <br />
    <p>If you have questions or comments about your privacy rights, you may email us at javor@mypie.app.</p>
    <br />
    <h2 id="section11">11. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
    <br />
    <p>
      Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature
      or setting you can activate to signal your privacy preference not to have data about your online browsing
      activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing
      DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism
      that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted
      that we must follow in the future, we will inform you about that practice in a revised version of this privacy
      notice.
    </p>
    <br />
    <p>
      California law requires us to let you know how we respond to web browser DNT signals. Because there currently is
      not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.
    </p>
    <br />
    <h2 id="section12">12. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong>If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana,
      Iowa, Kentucky, Montana, New Hampshire, New Jersey, Oregon, Tennessee, Texas, Utah, or Virginia, you may have the
      right to request access to and receive details about the personal information we maintain about you and how we
      have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the
      right to withdraw your consent to our processing of your personal information. These rights may be limited in some
      circumstances by applicable law. More information is provided below.
    </p>
    <br />
    <h3>Categories of Personal Information We Collect</h3>
    <br />
    <p>We have collected the following categories of personal information in the past twelve (12) months:</p>
    <br />
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Examples</th>
          <th>Collected</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>A. Identifiers</td>
          <td>
            Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique
            personal identifier, online identifier, Internet Protocol address, email address, and account name
          </td>
          <td>NO</td>
        </tr>
        <tr>
          <td>B. Personal information as defined in the California Customer Records statute</td>
          <td>Name, contact information, education, employment, employment history, and financial information</td>
          <td>NO</td>
        </tr>
        <tr>
          <td>C. Protected classification characteristics under state or federal law</td>
          <td>
            Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data
          </td>
          <td>NO</td>
        </tr>
        <tr>
          <td>D. Commercial information</td>
          <td>Transaction information, purchase history, financial details, and payment information</td>
          <td>NO</td>
        </tr>
        <tr>
          <td>E. Biometric information</td>
          <td>Fingerprints and voiceprints</td>
          <td>NO</td>
        </tr>
        <tr>
          <td>F. Internet or other similar network activity</td>
          <td>
            Browsing history, search history, online behavior, interest data, and interactions with our and other
            websites, applications, systems, and advertisements
          </td>
          <td>NO</td>
        </tr>
        <tr>
          <td>G. Geolocation data</td>
          <td>Device location</td>
          <td>NO</td>
        </tr>
        <tr>
          <td>H. Audio, electronic, sensory, or similar information</td>
          <td>Images and audio, video or call recordings created in connection with our business activities</td>
          <td>NO</td>
        </tr>
        <tr>
          <td>I. Professional or employment-related information</td>
          <td>
            Business contact details in order to provide you our Services at a business level or job title, work
            history, and professional qualifications if you apply for a job with us
          </td>
          <td>NO</td>
        </tr>
        <tr>
          <td>J. Education Information</td>
          <td>Student records and directory information</td>
          <td>NO</td>
        </tr>
        <tr>
          <td>K. Inferences drawn from collected personal information</td>
          <td>
            Inferences drawn from any of the collected personal information listed above to create a profile or summary
            about, for example, an individual's preferences and characteristics
          </td>
          <td>NO</td>
        </tr>
        <tr>
          <td>L. Sensitive personal Information</td>
          <td></td>
          <td>NO</td>
        </tr>
      </tbody>
    </table>
    <br />
    <p>
      We may also collect other personal information outside of these categories through instances where you interact
      with us in person, online, or by phone or mail in the context of:
    </p>
    <ul className={'pl-10'}>
      <li>Receiving help through our customer support channels;</li>
      <li>Participation in customer surveys or contests; and</li>
      <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
    </ul>
    <br />
    <p>We will use and retain the collected personal information as needed to provide the Services or for:</p>
    <ul className={'pl-10'}>
      <li>Category H - As long as the user has an account with us</li>
    </ul>
    <br />
    <h3>Sources of Personal Information</h3>
    <br />
    <p>
      Learn more about the sources of personal information we collect in
      <a href="#section1"> "WHAT INFORMATION DO WE COLLECT?"</a>
    </p>
    <br />
    <h3> How We Use and Share Personal Information</h3>
    <br />
    <p>
      Learn about how we use your personal information in the section,{' '}
      <a href="#section1"> "HOW DO WE PROCESS YOUR INFORMATION?"</a>
    </p>
    <br />
    <h4>
      <strong>Will your information be shared with anyone else?</strong>
    </h4>
    <br />
    <p>
      {' '}
      We may disclose your personal information with our service providers pursuant to a written contract between us and
      each service provider. Learn more about how we disclose personal information to in the section,{' '}
      <a href="#section4">"WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?"</a>
    </p>
    <br />
    <p>
      We may use your personal information for our own business purposes, such as for undertaking internal research for
      technological development and demonstration. This is not considered to be "selling" of your personal information.
    </p>
    <br />
    <p>
      We have not disclosed, sold, or shared any personal information to third parties for a business or commercial
      purpose in the preceding twelve (12) months. We will not sell or share personal information in the future
      belonging to website visitors, users, and other consumers.
    </p>
    <br />
    <h3>Your Rights</h3>
    <br />
    <p>
      You have rights under certain US state data protection laws. However, these rights are not absolute, and in
      certain cases, we may decline your request as permitted by law. These rights include:
    </p>
    <ul className={'pl-10'}>
      <li>
        <span>
          <strong>Right to know </strong>whether or not we are processing your personal data
        </span>
      </li>
      <li>
        <span>
          <strong>Right to access </strong> your personal data
        </span>
      </li>
      <li>
        <span>
          <strong>Right to correct </strong>inaccuracies in your personal data
        </span>
      </li>
      <li>
        <span>
          <strong>Right to request </strong>the deletion of your personal data
        </span>
      </li>
      <li>
        <span>
          <strong>Right to obtain a copy </strong> of the personal data you previously shared with us
        </span>
      </li>
      <li>
        <span>
          <strong>Right to non-discrimination </strong> for exercising your rights
        </span>
      </li>{' '}
      <li>
        <span>
          <strong>Right to opt out </strong> of the processing of your personal data if it is used for targeted
          advertising (or sharing as defined under California's privacy law), the sale of personal data, or profiling in
          furtherance of decisions that produce legal or similarly significant effects ("profiling")
        </span>
      </li>
    </ul>
    <br />
    <span>Depending upon the state where you live, you may also have the following rights:</span>
    <br />
    <ul className={'pl-10'}>
      <li>
        Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted
        by applicable law, including California's and Delaware's privacy law)
      </li>
      <li>
        Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by
        applicable law, including Oregon's privacy law)
      </li>
      <li>
        Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including
        California's privacy law)
      </li>
      <li>
        Right to opt out of the collection of sensitive data and personal data collected through the operation of a
        voice or facial recognition feature (as permitted by applicable law, including Florida's privacy law)
      </li>
    </ul>
    <br />
    <h3>How to Exercise Your Rights</h3>
    <br />
    <p>
      To exercise these rights, you can contact us by submitting a
      <NavLink target="_blank" to="https://app.termly.io/notify/cd5350ec-e580-4de7-a61b-fbe8fa59fae8">
        {' '}
        data subject access request
      </NavLink>
      , by emailing us at javor@mypie.app, Wittgensteinlaan 281, 1062 KH Amsterdam, or by referring to the contact
      details at the bottom of this document.
    </p>
    <br />
    <p>
      We will honor your opt-out preferences if you enact the{' '}
      <NavLink target="_blank" to="https://globalprivacycontrol.org/">
        Global Privacy Control
      </NavLink>{' '}
      (GPC) opt-out signal on your browser.
    </p>
    <br />
    <p>
      Under certain US state data protection laws, you can designate an authorized agent to make a request on your
      behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly
      authorized to act on your behalf in accordance with applicable laws.
    </p>
    <br />
    <h3>Request Verification</h3>
    <br />
    <p>
      Upon receiving your request, we will need to verify your identity to determine you are the same person about whom
      we have the information in our system. We will only use personal information provided in your request to verify
      your identity or authority to make the request. However, if we cannot verify your identity from the information
      already maintained by us, we may request that you provide additional information for the purposes of verifying
      your identity and for security or fraud-prevention purposes.
    </p>
    <br />
    <p>
      If you submit the request through an authorized agent, we may need to collect additional information to verify
      your identity before processing your request and the agent will need to provide a written and signed permission
      from you to submit such request on your behalf.
    </p>
    <br />
    <h3>Appeals</h3>
    <br />
    <p>
      Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal
      our decision by emailing us at javor@mypie.app. We will inform you in writing of any action taken or not taken in
      response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is
      denied, you may submit a complaint to your state attorney general.
    </p>
    <br />
    <h3>California "Shine The Light" Law</h3>
    <br />
    <p>
      California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are
      California residents to request and obtain from us, once a year and free of charge, information about categories
      of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and
      addresses of all third parties with which we shared personal information in the immediately preceding calendar
      year. If you are a California resident and would like to make such a request, please submit your request in
      writing to us by using the contact details provided in the section
      <a href="#section15"> "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"</a>
    </p>
    <br />
    <h2 id="section13">13. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong> You may have additional rights based on the country you reside in.
    </p>
    <br />
    <h3>Australia and New Zealand</h3>
    <br />
    <p>
      We collect and process your personal information under the obligations and conditions set by Australia's Privacy
      Act 1988 and New Zealand's Privacy Act 2020 (Privacy Act).
    </p>
    <br />
    <p>
      This privacy notice satisfies the notice requirements defined in both Privacy Acts, in particular: what personal
      information we collect from you, from which sources, for which purposes, and other recipients of your personal
      information.
    </p>
    <br />
    <span>
      If you do not wish to provide the personal information necessary to fulfill their applicable purpose, it may
      affect our ability to provide our services, in particular:
    </span>
    <br />
    <ul className={'pl-10'}>
      <li>offer you the products or services that you want</li>
      <li>respond to or help with your requests</li>
      <li>manage your account with us</li>
      <li>confirm your identity and protect your account</li>
    </ul>
    <br />
    <p>
      At any time, you have the right to request access to or correction of your personal information. You can make such
      a request by contacting us by using the contact details provided in the section
      <a href="#section16"> "HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?"</a>
    </p>
    <br />
    <p>
      If you believe we are unlawfully processing your personal information, you have the right to submit a complaint
      about a breach of the Australian Privacy Principles to the
      <NavLink
        target="_blank"
        to="https://www.oaic.gov.au/privacy/privacy-complaints/lodge-a-privacy-complaint-with-us"
      >
        {' '}
        Office of the Australian Information Commissioner
      </NavLink>
      and a breach of New Zealand's Privacy Principles to the
      <NavLink target="_blank" to="https://www.privacy.org.nz/your-rights/making-a-complaint/">
        {' '}
        Office of New Zealand Privacy Commissioner.
      </NavLink>
    </p>
    <br />
    <h3>Republic of South Africa</h3>
    <br />
    <p>
      At any time, you have the right to request access to or correction of your personal information. You can make such
      a request by contacting us by using the contact details provided in the section
      <a href="#section16"> "HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?"</a>
    </p>
    <br />
    <p>
      If you are unsatisfied with the manner in which we address any complaint with regard to our processing of personal
      information, you can contact the office of the regulator, the details of which are:
    </p>
    <br />
    <NavLink to="https://inforegulator.org.za/">The Information Regulator (South Africa)</NavLink>
    <p>
      General enquiries: <NavLink to="mailto:enquiries@inforegulator.org.za">enquiries@inforegulator.org.za</NavLink>
    </p>
    <p>
      Complaints (complete POPIA/PAIA form 5):{' '}
      <NavLink to="mailto:PAIAComplaints@inforegulator.org.za">PAIAComplaints@inforegulator.org.za</NavLink> &{' '}
      <NavLink to="mailto:POPIAComplaints@inforegulator.org.za">POPIAComplaints@inforegulator.org.za</NavLink>
    </p>
    <br />
    <h2 id="section14">14. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
    <br />
    <p className={'italic'}>
      <strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.
    </p>
    <br />
    <p>
      We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised"
      date at the top of this privacy notice. If we make material changes to this privacy notice, we may notify you
      either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you
      to review this privacy notice frequently to be informed of how we are protecting your information.
    </p>
    <br />
    <h2 id="section15">15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
    <br />
    <p>
      If you have questions or comments about this notice, you may contact our Data Protection Officer (DPO) by email at
      javor@mypie.app, by phone at +31651683333, or contact us by post at:
    </p>
    <br />
    <address className={'flex-col flex gap-1 not-italic'}>
      <span>StreamSupport, Inc.</span>
      <span>Data Protection Officer</span>
      <span>Wittgensteinlaan, 281</span>
      <span>Amsterdam 1062KH</span>
      <span>Netherlands</span>
    </address>
    <br />
    <p>
      If you are a resident in the European Economic Area, we are the "data controller" of your personal information. We
      have appointed Javor Vatchkov to be our representative in the EEA. You can contact them directly regarding our
      processing of your information, by email at javor@mypie.app, by phone at +31651683333, or by post to:
    </p>
    <br />
    <address className={'flex-col flex gap-1 not-italic'}>
      <span>Wittgensteinlaan, 281</span>
      <span>Amsterdam 1062KH</span>
      <span>Netherlands</span>
    </address>
    <br />
    <span className={'underline'}>Swiss Representative</span>
    <br />
    <br />
    <div>__________</div>
    <div>__________</div>
    <div>__________ __________</div>
    <p>Switzerland</p>
    <br />
    <h2 id="section16">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
    <br />
    <p>
      Based on the applicable laws of your country or state of residence in the US, you may have the right to request
      access to the personal information we collect from you, details about how we have processed it, correct
      inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our
      processing of your personal information. These rights may be limited in some circumstances by applicable law. To
      request to review, update, or delete your personal information, please fill out and submit a
    </p>
    <NavLink target="_blank" to="https://app.termly.io/notify/cd5350ec-e580-4de7-a61b-fbe8fa59fae8">
      data subject access request
    </NavLink>
    <h2 id="section17">17. FEES AND PAYMENTS</h2>
    <br />
    <p>
      When you make contributions through our platform, we apply a platform fee of 5% per Pie, capped at $10. Additionally,
      Stripe processing fees apply to all transactions. We collect and remit VAT quarterly where applicable. All fan
      contributions are voluntary "gifts" and do not entitle you to any goods or services.
    </p>
    <br />
    <h2 id="section18">18. CONTRIBUTIONS AND DATA OWNERSHIP</h2>
    <br />
    <p>
      All listening and contribution data remain StreamSupport's property even after account deletion. If we publish any such data,
      it will be in anonymized form. We make best efforts to transfer contributions to artists but cannot guarantee
      successful delivery in all cases. We rely on third-party data from Spotify for social log-ins and listening activity.
    </p>
    <br />
    <p>
      We may publicly aggregate listening metrics (e.g., Earth Chart) in non-identifying, aggregate form. For abandoned
      accounts (12 months of inactivity), we will donate unclaimed funds annually. You have 18 months to reactivate your
      account and reclaim your funds.
    </p>
    <br />
    <h2 id="section19">19. AUTOMATED DECISION MAKING AND PROFILING</h2>
    <br />
    <p>
      We use automated decision-making, including profiling, to calculate the LISTEN-TIME-FACTOR for distributing your
      contributions. You have the right to object to this processing and request human review of any automated decisions
      that affect you.
    </p>
    <br />
    <h2 id="section20">20. DATA BREACH NOTIFICATION</h2>
    <br />
    <p>
      In the event of a data breach that affects your personal information, we will notify you within 72 hours of becoming
      aware of the breach, unless the breach is unlikely to result in a risk to your rights and freedoms.
    </p>
    <br />
    <h2 id="section21">21. INTERNATIONAL DATA TRANSFERS</h2>
    <br />
    <p>
      When we transfer your personal information outside of your country of residence, we implement appropriate safeguards,
      including standard contractual clauses, to ensure your data remains protected.
    </p>
    <br />
    <h2 id="section22">22. COOKIES AND TRACKING</h2>
    <br />
    <p>
      We use cookies and similar tracking technologies to improve your experience on our platform. You can manage your cookie
      preferences at any time through your Profile Settings, where you can opt out of non-essential cookies with one click.
      Essential cookies required for the basic functionality of our Services cannot be disabled.
    </p>
    <br />
    <h2 id="section23">23. DATA CONTROLLER STATUS</h2>
    <br />
    <p>
      We act as a data controller for fan data and as a data processor for artist/label data. This means we determine
      the purposes and means of processing fan data, while processing artist/label data according to their instructions.
    </p>
    <br />
    <h2 id="section24">24. MINOR PROTECTION</h2>
    <br />
    <p>
      We do not knowingly collect personal information from individuals under 18 years of age. If we discover that we have
      collected personal information from a minor, we will promptly delete such information.
    </p>
    <br />
    <div>__________</div>
    <div>__________</div>
    <div>__________ __________</div>
    <p>Switzerland</p>
    <br />
    <h2 id="section16">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
    <br />
    <p>
      As a research participant, you have the right to request access to the personal information we collect from you,
      details about how we have processed it, correct inaccuracies, or delete your personal information. You may also
      have the right to withdraw your consent to our processing of your personal information. To request to review,
      update, or delete your personal information, please contact the research team directly.
    </p>
    <br />

    <h2 id="section25">25. RESEARCH-SPECIFIC PRIVACY CONSIDERATIONS</h2>
    <br />
    <h3>25.1 Academic Research Context</h3>
    <p>
      This privacy policy applies to an academic research project investigating listener-driven micro-donations in music
      streaming. All data collection and processing is conducted in accordance with university research ethics guidelines
      and applicable data protection laws.
    </p>
    <br />
    <h3>25.2 Research Data Retention</h3>
    <p>
      Research data will be retained for the duration of the academic project and may be kept for additional time as
      required by university research policies. Anonymized data may be retained indefinitely for academic purposes.
    </p>
    <br />
    <h3>25.3 Publication and Presentation</h3>
    <p>
      Aggregated, anonymized data may be used in academic publications, presentations, and thesis documentation.
      No individual participant data will be identifiable in any public materials.
    </p>
    <br />
    <h3>25.4 Research Ethics Compliance</h3>
    <p>
      This research has been designed and will be conducted in accordance with university research ethics guidelines.
      If you have concerns about the research, please contact the university's research ethics committee.
    </p>
    <br />

    <div className={'text-sm text-gray-600 mt-8 p-4 bg-gray-100 rounded'}>
      <p><strong>Research Project:</strong> Listener-Driven Micro-Donations in Music Streaming: A System Design and Evaluation</p>
      <p><strong>Academic Institution:</strong> [University Name]</p>
      <p><strong>Research Type:</strong> Academic Thesis Project</p>
      <p><strong>Purpose:</strong> System Design and Evaluation Research</p>
      <p><strong>Data Protection:</strong> Conducted in accordance with university research ethics guidelines</p>
    </div>
  </div>
);

export default PolicyPage;
