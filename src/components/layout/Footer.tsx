const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p className="font-body">
          &copy; {new Date().getFullYear()} ArtsyCraftsy. All rights reserved.
        </p>
        <p className="font-body text-sm mt-1">
          Crafted with <span className="text-red-500">&hearts;</span> by AI and
          Humans
        </p>
      </div>
    </footer>
  );
};

export default Footer;
